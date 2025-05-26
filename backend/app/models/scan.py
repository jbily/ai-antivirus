from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from uuid import uuid4, UUID

class ScanBase(SQLModel):
    """Base model for scan data"""
    dataset_name: Optional[str] = None
    ip_addresses: str  # Comma-separated list of IPs/CIDR ranges
    status: str = "pending"  # pending, running, completed, failed
    progress: int = 0  # 0-100 percentage
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Scan(ScanBase, table=True):
    """Scan table model"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    file_results: List["FileResult"] = Relationship(back_populates="scan")
    host_results: List["HostResult"] = Relationship(back_populates="scan")

class ScanCreate(ScanBase):
    """Schema for creating a new scan"""
    pass

class ScanRead(ScanBase):
    """Schema for reading scan data"""
    id: UUID

class ScanUpdate(SQLModel):
    """Schema for updating scan data"""
    status: Optional[str] = None
    progress: Optional[int] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FileResultBase(SQLModel):
    """Base model for file scan results"""
    filename: str
    risk_score: float  # 0-100
    threat_type: Optional[str] = None
    recommendation: Optional[str] = None

class FileResult(FileResultBase, table=True):
    """File result table model"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    scan_id: UUID = Field(foreign_key="scan.id")
    scan: Scan = Relationship(back_populates="file_results")

class FileResultCreate(FileResultBase):
    """Schema for creating a new file result"""
    scan_id: UUID

class FileResultRead(FileResultBase):
    """Schema for reading file result data"""
    id: UUID
    scan_id: UUID

class HostResultBase(SQLModel):
    """Base model for host scan results"""
    ip_address: str
    risk_score: float  # 0-100
    open_ports: str  # JSON string of open ports and services
    threat_type: Optional[str] = None
    recommendation: Optional[str] = None

class HostResult(HostResultBase, table=True):
    """Host result table model"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    scan_id: UUID = Field(foreign_key="scan.id")
    scan: Scan = Relationship(back_populates="host_results")

class HostResultCreate(HostResultBase):
    """Schema for creating a new host result"""
    scan_id: UUID

class HostResultRead(HostResultBase):
    """Schema for reading host result data"""
    id: UUID
    scan_id: UUID
