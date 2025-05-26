import asyncio
import json
import csv
import nmap
import time
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
import pandas as pd
from uuid import UUID

from app.models.scan import Scan, FileResult, FileResultCreate, HostResult, HostResultCreate
from app.ml.model import predict_risk
from app.core.config import settings

class ScanManager:
    """
    Manages the scanning process for both files and hosts
    """
    def __init__(self, scan_id: str, connection_manager):
        self.scan_id = scan_id
        self.connection_manager = connection_manager
        self.scanner = nmap.PortScanner()
    
    async def update_progress(self, progress: int, status: str, message: str = ""):
        """
        Update scan progress and send WebSocket update
        """
        await self.connection_manager.broadcast(
            self.scan_id,
            {
                "scan_id": self.scan_id,
                "progress": progress,
                "status": status,
                "message": message
            }
        )
    
    async def run_scan(self, ip_addresses: List[str], dataset_path: Optional[str], session: Session):
        """
        Run the scan process
        """
        try:
            # Update scan status to running
            db_scan = session.get(Scan, UUID(self.scan_id))
            db_scan.status = "running"
            db_scan.progress = 0
            session.add(db_scan)
            session.commit()
            
            await self.update_progress(0, "running", "Starting scan...")
            
            # Process dataset if provided
            file_results = []
            if dataset_path:
                await self.update_progress(10, "running", "Processing dataset...")
                file_results = await self.process_dataset(dataset_path, session)
                await self.update_progress(50, "running", f"Dataset processed. Found {len(file_results)} potential threats.")
            
            # Scan hosts
            await self.update_progress(60, "running", "Scanning network hosts...")
            host_results = await self.scan_hosts(ip_addresses, session)
            await self.update_progress(90, "running", f"Host scan completed. Found {len(host_results)} potential threats.")
            
            # Update scan status to completed
            db_scan = session.get(Scan, UUID(self.scan_id))
            db_scan.status = "completed"
            db_scan.progress = 100
            session.add(db_scan)
            session.commit()
            
            await self.update_progress(100, "completed", "Scan completed successfully.")
            
        except Exception as e:
            # Update scan status to failed
            db_scan = session.get(Scan, UUID(self.scan_id))
            db_scan.status = "failed"
            session.add(db_scan)
            session.commit()
            
            await self.update_progress(0, "failed", f"Scan failed: {str(e)}")
    
    async def process_dataset(self, dataset_path: str, session: Session) -> List[FileResult]:
        """
        Process the uploaded dataset and detect threats
        """
        file_results = []
        
        try:
            # Determine file type (CSV or JSON)
            if dataset_path.endswith('.csv'):
                # Process CSV file
                data = pd.read_csv(dataset_path)
            elif dataset_path.endswith('.json'):
                # Process JSON file
                data = pd.read_json(dataset_path)
            else:
                raise ValueError("Unsupported file format. Only CSV and JSON are supported.")
            
            # Process each row in the dataset
            total_rows = len(data)
            for i, row in enumerate(data.iterrows()):
                # Extract features for prediction
                features = self._extract_features(row[1])
                
                # Predict risk using ML model
                risk_score, threat_type = predict_risk(features)
                
                # Generate recommendation based on threat type
                recommendation = self._generate_recommendation(threat_type, risk_score)
                
                # Create file result
                file_result = FileResultCreate(
                    scan_id=UUID(self.scan_id),
                    filename=f"Row {i+1}",
                    risk_score=risk_score,
                    threat_type=threat_type,
                    recommendation=recommendation
                )
                
                # Add to database
                db_file_result = FileResult.from_orm(file_result)
                session.add(db_file_result)
                session.commit()
                session.refresh(db_file_result)
                
                file_results.append(db_file_result)
                
                # Update progress periodically
                if i % max(1, total_rows // 10) == 0:
                    progress = 10 + int((i / total_rows) * 40)
                    await self.update_progress(
                        progress, 
                        "running", 
                        f"Processing dataset: {i+1}/{total_rows} rows"
                    )
                
                # Small delay to prevent database locking
                await asyncio.sleep(0.01)
        
        except Exception as e:
            await self.update_progress(0, "failed", f"Dataset processing failed: {str(e)}")
            raise
        
        return file_results
    
    async def scan_hosts(self, ip_addresses: List[str], session: Session) -> List[HostResult]:
        """
        Scan network hosts and detect threats
        """
        host_results = []
        
        try:
            total_ips = len(ip_addresses)
            for i, ip in enumerate(ip_addresses):
                # Update progress
                progress = 50 + int((i / total_ips) * 40)
                await self.update_progress(
                    progress, 
                    "running", 
                    f"Scanning host {i+1}/{total_ips}: {ip}"
                )
                
                # Scan host with nmap
                try:
                    self.scanner.scan(ip, arguments='-sV -F')
                    scan_results = self.scanner.get(ip, {})
                except Exception as e:
                    # If scan fails, create a result with error
                    host_result = HostResultCreate(
                        scan_id=UUID(self.scan_id),
                        ip_address=ip,
                        risk_score=0,
                        open_ports="{}",
                        threat_type="Scan failed",
                        recommendation=f"Could not scan host: {str(e)}"
                    )
                    
                    db_host_result = HostResult.from_orm(host_result)
                    session.add(db_host_result)
                    session.commit()
                    session.refresh(db_host_result)
                    
                    host_results.append(db_host_result)
                    continue
                
                # Extract features from scan results
                features = self._extract_host_features(scan_results)
                
                # Predict risk using ML model
                risk_score, threat_type = predict_risk(features)
                
                # Generate recommendation based on threat type
                recommendation = self._generate_recommendation(threat_type, risk_score)
                
                # Format open ports as JSON string
                open_ports = {}
                if 'tcp' in scan_results:
                    for port, port_info in scan_results['tcp'].items():
                        open_ports[str(port)] = {
                            'state': port_info.get('state', ''),
                            'name': port_info.get('name', ''),
                            'product': port_info.get('product', ''),
                            'version': port_info.get('version', '')
                        }
                
                # Create host result
                host_result = HostResultCreate(
                    scan_id=UUID(self.scan_id),
                    ip_address=ip,
                    risk_score=risk_score,
                    open_ports=json.dumps(open_ports),
                    threat_type=threat_type,
                    recommendation=recommendation
                )
                
                # Add to database
                db_host_result = HostResult.from_orm(host_result)
                session.add(db_host_result)
                session.commit()
                session.refresh(db_host_result)
                
                host_results.append(db_host_result)
                
                # Small delay to prevent database locking
                await asyncio.sleep(0.1)
        
        except Exception as e:
            await self.update_progress(0, "failed", f"Host scanning failed: {str(e)}")
            raise
        
        return host_results
    
    def _extract_features(self, row) -> Dict[str, Any]:
        """
        Extract features from dataset row for ML prediction
        """
        # This is a simplified example
        # In a real-world scenario, you would extract relevant features
        # based on your dataset structure and ML model requirements
        features = {}
        
        # Convert row to dictionary if it's not already
        if not isinstance(row, dict):
            row = row.to_dict()
        
        # Add all row data as features
        features.update(row)
        
        return features
    
    def _extract_host_features(self, scan_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract features from nmap scan results for ML prediction
        """
        features = {
            'total_open_ports': 0,
            'has_ssh': False,
            'has_http': False,
            'has_https': False,
            'has_ftp': False,
            'has_telnet': False,
            'has_smb': False,
            'has_rdp': False,
            'has_unusual_ports': False
        }
        
        # Check if TCP scan results exist
        if 'tcp' in scan_results:
            # Count open ports
            features['total_open_ports'] = len(scan_results['tcp'])
            
            # Check for specific services
            for port, port_info in scan_results['tcp'].items():
                port_name = port_info.get('name', '').lower()
                
                if port_name == 'ssh':
                    features['has_ssh'] = True
                elif port_name == 'http':
                    features['has_http'] = True
                elif port_name == 'https':
                    features['has_https'] = True
                elif port_name == 'ftp':
                    features['has_ftp'] = True
                elif port_name == 'telnet':
                    features['has_telnet'] = True
                elif port_name in ['smb', 'netbios-ssn']:
                    features['has_smb'] = True
                elif port_name == 'ms-wbt-server' or port == 3389:
                    features['has_rdp'] = True
                
                # Check for unusual ports
                if port not in [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5900]:
                    features['has_unusual_ports'] = True
        
        return features
    
    def _generate_recommendation(self, threat_type: str, risk_score: float) -> str:
        """
        Generate a recommendation based on the threat type and risk score
        """
        if not threat_type:
            return "No action required."
        
        if risk_score < 30:
            return f"Low risk {threat_type} detected. Monitor for changes in behavior."
        elif risk_score < 70:
            return f"Medium risk {threat_type} detected. Investigate further and consider isolation."
        else:
            return f"High risk {threat_type} detected. Immediate action required. Isolate and remove the threat."
