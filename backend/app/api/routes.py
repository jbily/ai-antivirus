from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, WebSocket, WebSocketDisconnect, Form
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from uuid import UUID
import json
import os
from datetime import datetime

from app.core.database import get_session
from app.models.scan import (
    Scan, ScanCreate, ScanRead, ScanUpdate,
    FileResult, FileResultCreate, FileResultRead,
    HostResult, HostResultCreate, HostResultRead
)
from app.utils.scan_manager import ScanManager
from app.utils.pdf_generator import generate_pdf_report
from app.core.config import settings

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, scan_id: str):
        await websocket.accept()
        if scan_id not in self.active_connections:
            self.active_connections[scan_id] = []
        self.active_connections[scan_id].append(websocket)

    def disconnect(self, websocket: WebSocket, scan_id: str):
        if scan_id in self.active_connections:
            self.active_connections[scan_id].remove(websocket)
            if not self.active_connections[scan_id]:
                del self.active_connections[scan_id]

    async def broadcast(self, scan_id: str, message: Dict[str, Any]):
        if scan_id in self.active_connections:
            for connection in self.active_connections[scan_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.post("/scan", response_model=ScanRead)
async def create_scan(
    background_tasks: BackgroundTasks,
    ip_addresses: str = Form(...),
    dataset: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session)
):
    """
    Create a new scan and start the scanning process in the background
    """
    # Create scan record
    scan_data = ScanCreate(ip_addresses=ip_addresses)
    
    # Handle dataset upload if provided
    dataset_path = None
    if dataset:
        # Save the uploaded file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        dataset_path = os.path.join(settings.UPLOAD_DIR, f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{dataset.filename}")
        
        with open(dataset_path, "wb") as f:
            content = await dataset.read()
            f.write(content)
        
        scan_data.dataset_name = dataset.filename
    
    # Create scan in database
    db_scan = Scan.from_orm(scan_data)
    session.add(db_scan)
    session.commit()
    session.refresh(db_scan)
    
    # Start background scan task
    scan_manager = ScanManager(str(db_scan.id), manager)
    background_tasks.add_task(
        scan_manager.run_scan,
        ip_addresses=ip_addresses.split(','),
        dataset_path=dataset_path,
        session=session
    )
    
    return db_scan

@router.get("/scan/{scan_id}", response_model=Dict[str, Any])
async def get_scan_results(scan_id: UUID, session: Session = Depends(get_session)):
    """
    Get the results of a scan
    """
    # Get scan from database
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get file results
    file_results = session.exec(
        select(FileResult).where(FileResult.scan_id == scan_id)
    ).all()
    
    # Get host results
    host_results = session.exec(
        select(HostResult).where(HostResult.scan_id == scan_id)
    ).all()
    
    # Format response
    return {
        "scan": {
            "id": str(scan.id),
            "dataset_name": scan.dataset_name,
            "ip_addresses": scan.ip_addresses,
            "status": scan.status,
            "progress": scan.progress,
            "created_at": scan.created_at.isoformat(),
            "updated_at": scan.updated_at.isoformat()
        },
        "file_results": [
            {
                "id": str(result.id),
                "filename": result.filename,
                "risk_score": result.risk_score,
                "threat_type": result.threat_type,
                "recommendation": result.recommendation
            }
            for result in file_results
        ],
        "host_results": [
            {
                "id": str(result.id),
                "ip_address": result.ip_address,
                "risk_score": result.risk_score,
                "open_ports": json.loads(result.open_ports) if result.open_ports else {},
                "threat_type": result.threat_type,
                "recommendation": result.recommendation
            }
            for result in host_results
        ]
    }

@router.get("/scan/{scan_id}/pdf")
async def get_scan_pdf_report(scan_id: UUID, session: Session = Depends(get_session)):
    """
    Generate and return a PDF report for the scan
    """
    # Get scan from database
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get file results
    file_results = session.exec(
        select(FileResult).where(FileResult.scan_id == scan_id)
    ).all()
    
    # Get host results
    host_results = session.exec(
        select(HostResult).where(HostResult.scan_id == scan_id)
    ).all()
    
    # Generate PDF report
    pdf_path = generate_pdf_report(scan, file_results, host_results)
    
    # Return PDF file
    from fastapi.responses import FileResponse
    return FileResponse(
        path=pdf_path,
        filename=f"ai_antivirus_report_{scan_id}.pdf",
        media_type="application/pdf"
    )

@router.websocket("/ws/{scan_id}")
async def websocket_endpoint(websocket: WebSocket, scan_id: str):
    """
    WebSocket endpoint for real-time scan progress updates
    """
    await manager.connect(websocket, scan_id)
    try:
        while True:
            # Keep the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, scan_id)

@router.get("/scans", response_model=List[ScanRead])
async def list_scans(session: Session = Depends(get_session)):
    """
    List all scans
    """
    scans = session.exec(select(Scan)).all()
    return scans

@router.delete("/scan/{scan_id}")
async def delete_scan(scan_id: UUID, session: Session = Depends(get_session)):
    """
    Delete a scan by ID
    """
    scan = session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    session.delete(scan)
    session.commit()
    return {"detail": "Scan deleted"}
