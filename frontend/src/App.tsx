import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FileDropzone from '@/components/FileDropzone';
import IpAddressInput from '@/components/IpAddressInput';
import ScanResults from '@/components/ScanResults';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createScan, getScanResults, getPdfReportUrl, createWebSocketConnection, ScanResult } from '@/utils/api';
import { Shield, Lock, Zap, Activity } from 'lucide-react';

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

  // Animation states
  const [showHero, setShowHero] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showScanSection, setShowScanSection] = useState(false);
  
  // Trigger animations on component mount
  useEffect(() => {
    // Staggered animations
    setTimeout(() => setShowHero(true), 100);
    setTimeout(() => setShowFeatures(true), 600);
    setTimeout(() => setShowScanSection(true), 1100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow hover:shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center group">
            <Shield className="mr-2 text-blue-600 animate-pulse group-hover:animate-spin-slow transition-all duration-300" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              {t('common.appName')}
            </span>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="animate-float">
              <Lock className="h-6 w-6 text-green-500 hover:text-green-600 transition-colors duration-300" />
            </div>
            <Button 
              variant="outline" 
              onClick={toggleLanguage} 
              className="animate-in fade-in duration-500 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
            >
              <span className="group-hover:animate-wiggle inline-block">
                {t('common.language')}: {i18n.language.toUpperCase()}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section with Animation */}
        <div className={`mb-8 text-center ${showHero ? 'animate-in fade-in-50 slide-in-from-bottom-10 duration-700' : 'opacity-0'}`}>
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse-glow"></div>
            <Shield className="h-24 w-24 text-blue-600 mx-auto animate-float" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-clip-text text-transparent animate-scale-up-down">
            AI-Powered Protection for Your Network
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-300 hover:text-gray-800">
            Advanced threat detection and network scanning with real-time updates and comprehensive reporting.
          </p>
          <div className="flex justify-center mt-8 space-x-4">
            <div className="animate-slide-in-left delay-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                <Zap className="h-8 w-8" />
              </div>
              <p className="mt-2 text-sm font-medium">Fast Scanning</p>
            </div>
            <div className="animate-slide-in-left delay-500">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                <Activity className="h-8 w-8" />
              </div>
              <p className="mt-2 text-sm font-medium">Real-time Updates</p>
            </div>
            <div className="animate-slide-in-left delay-700">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                <Lock className="h-8 w-8" />
              </div>
              <p className="mt-2 text-sm font-medium">Secure Analysis</p>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${showFeatures ? 'animate-in fade-in-50 slide-in-from-bottom-5 duration-700' : 'opacity-0'}`}>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Malware Detection</h3>
            </div>
            <p className="text-gray-600">Advanced AI algorithms to detect and analyze potential threats in your datasets.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <Zap className="h-8 w-8 text-yellow-500 mr-3" />
              <h3 className="text-xl font-semibold">Network Scanning</h3>
            </div>
            <p className="text-gray-600">Comprehensive scanning of your network for vulnerabilities and suspicious activities.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold">Real-time Updates</h3>
            </div>
            <p className="text-gray-600">Live progress tracking and instant notifications about detected threats.</p>
          </div>
        </div>
        <div className={`bg-white shadow-lg hover:shadow-xl transition-all duration-500 rounded-lg p-6 mb-6 ${showScanSection ? 'animate-in fade-in-50 slide-in-from-bottom-5 duration-700' : 'opacity-0'}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              <Lock className="mr-2 text-blue-600 relative z-10 group-hover:text-blue-800 group-hover:scale-110 transition-all duration-300" />
            </div>
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent group-hover:from-blue-800 group-hover:to-blue-600 transition-all duration-300">
              {t('common.scan')}
            </span>
          </h2>
          
          {/* File Upload */}
          <div className="mb-6 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 animate-pulse-glow">
                <span className="text-blue-600 text-xs font-bold">1</span>
              </div>
              {t('common.uploadDataset')}
            </h3>
            <FileDropzone onFileAccepted={handleFileSelected} className="h-48 border-dashed border-2 border-blue-200 hover:border-blue-400 transition-colors duration-300" />
            {selectedFile && (
              <div className="mt-2 text-sm text-green-600 flex items-center animate-in fade-in slide-in-from-left duration-300">
                <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                File selected: {selectedFile.name}
              </div>
            )}
          </div>
          
          {/* IP Address Input */}
          <div className="mb-6 transform hover:scale-[1.01] transition-transform duration-300">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 animate-pulse-glow">
                <span className="text-blue-600 text-xs font-bold">2</span>
              </div>
              {t('common.enterIpAddresses')}
            </h3>
            <IpAddressInput onIpAddressesChange={handleIpAddressesChange} />
            {ipAddresses.length > 0 && (
              <div className="mt-2 text-sm text-green-600 flex items-center animate-in fade-in slide-in-from-left duration-300">
                <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                {ipAddresses.length} address{ipAddresses.length > 1 ? 'es' : ''} added
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md animate-wiggle">
              {error}
            </div>
          )}
          
          {/* Start Scan Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleStartScan} 
              disabled={isScanning || ipAddresses.length === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 
                ${isScanning || ipAddresses.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg animate-bounce-slow hover:animate-none'}
                ${ipAddresses.length > 0 ? 'animate-pulse-glow' : ''}`}
            >
              <div className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                {t('common.startScan')}
              </div>
            </Button>
          </div>
        </div>
        
        {/* Scan Progress */}
        {isScanning && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-500 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 animate-pulse-glow"></div>
                  <Activity className="text-blue-600 animate-spin-slow relative z-10" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('common.scanInProgress')}
                </span>
              </h2>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full animate-pulse-glow">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">Live</span>
              </div>
            </div>
            
            <div className="relative mb-6">
              <Progress value={scanProgress} className="mb-2 h-4 bg-blue-100 rounded-full overflow-hidden" />
              <div 
                className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70 blur-sm rounded-full transition-all duration-300" 
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm hover:shadow transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-xs uppercase text-blue-500 font-semibold mb-1">Status</div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="font-medium">{scanStatus}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm hover:shadow transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-xs uppercase text-blue-500 font-semibold mb-1">Progress</div>
                <div className="font-medium text-lg">{scanProgress}%</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg shadow-sm hover:shadow transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-xs uppercase text-blue-500 font-semibold mb-1">Estimated Time</div>
                <div className="font-medium">{Math.max(5 - Math.floor(scanProgress / 20), 0)} min</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex items-start">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 animate-bounce-slow" />
                <div>
                  <div className="font-medium">Current Activity</div>
                  <div className="text-sm text-gray-600">{scanMessage}</div>
                </div>
              </div>
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
