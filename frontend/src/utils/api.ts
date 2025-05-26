import axios from 'axios';

const API_URL = '/api';

// Types
export interface ScanResult {
  scan: {
    id: string;
    dataset_name: string | null;
    ip_addresses: string;
    status: string;
    progress: number;
    created_at: string;
    updated_at: string;
  };
  file_results: {
    id: string;
    filename: string;
    risk_score: number;
    threat_type: string | null;
    recommendation: string | null;
  }[];
  host_results: {
    id: string;
    ip_address: string;
    risk_score: number;
    open_ports: Record<string, any>;
    threat_type: string | null;
    recommendation: string | null;
  }[];
}

// Create a scan
export const createScan = async (formData: FormData): Promise<{ id: string }> => {
  try {
    const response = await axios.post(`${API_URL}/scan`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating scan:', error);
    throw error;
  }
};

// Get scan results
export const getScanResults = async (scanId: string): Promise<ScanResult> => {
  try {
    const response = await axios.get(`${API_URL}/scan/${scanId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting scan results:', error);
    throw error;
  }
};

// Get PDF report URL
export const getPdfReportUrl = (scanId: string): string => {
  return `${API_URL}/scan/${scanId}/pdf`;
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (scanId: string, onMessage: (data: any) => void): WebSocket => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/${scanId}`;
  
  const socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
  
  return socket;
};
