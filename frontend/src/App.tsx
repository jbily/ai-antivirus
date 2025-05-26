import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '@/components/FileDropzone';
import IpAddressInput from '@/components/IpAddressInput';
import ScanResults from '@/components/ScanResults';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createScan, getScanResults, getPdfReportUrl, createWebSocketConnection, ScanResult } from '@/utils/api';

function App() {
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ipAddresses, setIpAddresses] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toggle language between English and French
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Handle file selection
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  // Handle IP addresses change
  const handleIpAddressesChange = (addresses: string[]) => {
    setIpAddresses(addresses);
  };

  // Start scan
  const handleStartScan = async () => {
    if (ipAddresses.length === 0) {
      setError(t('ipInput.placeholder'));
      return;
    }

    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanStatus('pending');
      setScanMessage(t('common.scanStarting'));
      setError(null);
      setScanResults(null);

      // Create form data
      const formData = new FormData();
      formData.append('ip_addresses', ipAddresses.join(','));
      
      if (selectedFile) {
        formData.append('dataset', selectedFile);
      }

      // Create scan
      const response = await createScan(formData);
      setCurrentScanId(response.id);

      // Connect to WebSocket for real-time updates
      const socket = createWebSocketConnection(response.id, (data) => {
        setScanProgress(data.progress);
        setScanStatus(data.status);
        setScanMessage(data.message);

        // If scan is completed or failed, get results
        if (data.status === 'completed' || data.status === 'failed') {
          fetchScanResults(response.id);
          socket.close();
        }
      });

    } catch (err) {
      console.error('Error starting scan:', err);
      setError('Failed to start scan. Please try again.');
      setIsScanning(false);
    }
  };

  // Fetch scan results
  const fetchScanResults = async (scanId: string) => {
    try {
      const results = await getScanResults(scanId);
      setScanResults(results);
      setIsScanning(false);
    } catch (err) {
      console.error('Error fetching scan results:', err);
      setError('Failed to fetch scan results. Please try again.');
      setIsScanning(false);
    }
  };

  // Handle download report
  const handleDownloadReport = () => {
    if (currentScanId) {
      window.open(getPdfReportUrl(currentScanId), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('common.appName')}</h1>
          <Button variant="outline" onClick={toggleLanguage}>
            {t('common.language')}: {i18n.language.toUpperCase()}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('common.scan')}</h2>
          
          {/* File Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('common.uploadDataset')}</h3>
            <FileDropzone onFileAccepted={handleFileSelected} className="h-48" />
          </div>
          
          {/* IP Address Input */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">{t('common.enterIpAddresses')}</h3>
            <IpAddressInput onIpAddressesChange={handleIpAddressesChange} />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* Start Scan Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleStartScan} 
              disabled={isScanning || ipAddresses.length === 0}
              className="px-6"
            >
              {t('common.startScan')}
            </Button>
          </div>
        </div>
        
        {/* Scan Progress */}
        {isScanning && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('common.scanInProgress')}</h2>
            <Progress value={scanProgress} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{scanMessage}</span>
              <span>{scanProgress}%</span>
            </div>
          </div>
        )}
        
        {/* Scan Results */}
        {scanResults && (
          <ScanResults results={scanResults} onDownloadReport={handleDownloadReport} />
        )}
      </main>
    </div>
  );
}

export default App;
