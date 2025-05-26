import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ScanResult } from '@/utils/api';

interface ScanResultsProps {
  results: ScanResult;
  onDownloadReport: () => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({ results, onDownloadReport }) => {
  const { t } = useTranslation();

  // Helper function to determine risk level color
  const getRiskColor = (score: number): string => {
    if (score >= 70) return 'bg-red-100 text-red-800';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Helper function to format risk level text
  const getRiskLevel = (score: number): string => {
    if (score >= 70) return t('report.highRisk');
    if (score >= 30) return t('report.mediumRisk');
    if (score > 0) return t('report.lowRisk');
    return t('report.noRisk');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('common.scanResults')}</h2>
        <Button onClick={onDownloadReport}>
          {t('common.downloadReport')}
        </Button>
      </div>

      {/* Scan Summary */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">{t('report.summary')}</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">ID</div>
            <div className="font-medium truncate">{results.scan.id.substring(0, 8)}...</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">{t('common.status')}</div>
            <div className="font-medium capitalize">{results.scan.status}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">{t('common.ipAddress')}</div>
            <div className="font-medium">{results.scan.ip_addresses}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500">{t('common.uploadDataset')}</div>
            <div className="font-medium">{results.scan.dataset_name || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* File Results */}
      {results.file_results.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">{t('report.fileResults')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.fileName')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.riskScore')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.threatType')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.recommendation')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.file_results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full ${getRiskColor(result.risk_score)}`}>
                        {result.risk_score.toFixed(1)} - {getRiskLevel(result.risk_score)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.threat_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.recommendation || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Host Results */}
      {results.host_results.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">{t('report.hostResults')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.ipAddress')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.riskScore')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.openPorts')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.threatType')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.recommendation')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.host_results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full ${getRiskColor(result.risk_score)}`}>
                        {result.risk_score.toFixed(1)} - {getRiskLevel(result.risk_score)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.keys(result.open_ports).length > 0 
                        ? Object.keys(result.open_ports).join(', ')
                        : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.threat_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {result.recommendation || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {results.file_results.length === 0 && results.host_results.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" 
            />
          </svg>
          <p className="text-lg text-gray-600">{t('common.noResults')}</p>
        </div>
      )}
    </div>
  );
};

export default ScanResults;
