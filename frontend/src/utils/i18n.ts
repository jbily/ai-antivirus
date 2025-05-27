import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  common: {
    appName: 'AI-Antivirus',
    scan: 'Scan',
    startScan: 'Start Scan',
    uploadDataset: 'Upload Dataset',
    enterIpAddresses: 'Enter IP Addresses',
    scanResults: 'Scan Results',
    downloadReport: 'Download Report',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noResults: 'No results found',
    scanCompleted: 'Scan Completed',
    scanFailed: 'Scan Failed',
    scanInProgress: 'Scan in Progress',
    scanStarting: 'Starting Scan...',
    scanProcessingDataset: 'Processing Dataset...',
    scanScanningHosts: 'Scanning Network Hosts...',
    threatDetected: 'Threat Detected',
    riskScore: 'Risk Score',
    threatType: 'Threat Type',
    recommendation: 'Recommendation',
    ipAddress: 'IP Address',
    openPorts: 'Open Ports',
    fileName: 'File Name',
    language: 'Language',
    // Added for features section
    malwareDetection: 'Malware Detection',
    malwareDetectionDesc: 'Advanced AI algorithms to detect and analyze potential threats in your datasets.',
    networkScanning: 'Network Scanning',
    networkScanningDesc: 'Comprehensive scanning of your network for vulnerabilities and suspicious activities.',
    realTimeUpdates: 'Real-time Updates',
    realTimeUpdatesDesc: 'Live progress tracking and instant notifications about detected threats.',
  },
  dropzone: {
    title: 'Drag & drop your dataset here',
    subtitle: 'or click to browse files',
    acceptedFormats: 'Accepted formats: CSV, JSON',
  },
  ipInput: {
    placeholder: 'Enter IP addresses or CIDR ranges (e.g., 192.168.1.1, 10.0.0.0/24)',
    addMore: 'Add more',
    remove: 'Remove',
  },
  report: {
    title: 'Scan Report',
    summary: 'Summary',
    fileResults: 'File Scan Results',
    hostResults: 'Host Scan Results',
    generalRecommendations: 'General Recommendations',
    highRisk: 'High Risk',
    mediumRisk: 'Medium Risk',
    lowRisk: 'Low Risk',
    noRisk: 'No Risk',
  },
};

// French translations
const frTranslations = {
  common: {
    appName: 'AI-Antivirus',
    scan: 'Analyser',
    startScan: 'Démarrer l\'analyse',
    uploadDataset: 'Télécharger l\'ensemble de données',
    enterIpAddresses: 'Entrer les adresses IP',
    scanResults: 'Résultats de l\'analyse',
    downloadReport: 'Télécharger le rapport',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    noResults: 'Aucun résultat trouvé',
    scanCompleted: 'Analyse terminée',
    scanFailed: 'Échec de l\'analyse',
    scanInProgress: 'Analyse en cours',
    scanStarting: 'Démarrage de l\'analyse...',
    scanProcessingDataset: 'Traitement de l\'ensemble de données...',
    scanScanningHosts: 'Analyse des hôtes réseau...',
    threatDetected: 'Menace détectée',
    riskScore: 'Score de risque',
    threatType: 'Type de menace',
    recommendation: 'Recommandation',
    ipAddress: 'Adresse IP',
    openPorts: 'Ports ouverts',
    fileName: 'Nom du fichier',
    language: 'Langue',
    // Added for features section
    malwareDetection: 'Détection de logiciels malveillants',
    malwareDetectionDesc: 'Algorithmes d\'IA avancés pour détecter et analyser les menaces potentielles dans vos ensembles de données.',
    networkScanning: 'Analyse du réseau',
    networkScanningDesc: 'Analyse complète de votre réseau pour détecter les vulnérabilités et les activités suspectes.',
    realTimeUpdates: 'Mises à jour en temps réel',
    realTimeUpdatesDesc: 'Suivi de la progression en direct et notifications instantanées des menaces détectées.',
  },
  dropzone: {
    title: 'Glissez et déposez votre ensemble de données ici',
    subtitle: 'ou cliquez pour parcourir les fichiers',
    acceptedFormats: 'Formats acceptés: CSV, JSON',
  },
  ipInput: {
    placeholder: 'Entrez les adresses IP ou les plages CIDR (ex: 192.168.1.1, 10.0.0.0/24)',
    addMore: 'Ajouter plus',
    remove: 'Supprimer',
  },
  report: {
    title: 'Rapport d\'analyse',
    summary: 'Résumé',
    fileResults: 'Résultats de l\'analyse de fichiers',
    hostResults: 'Résultats de l\'analyse d\'hôtes',
    generalRecommendations: 'Recommandations générales',
    highRisk: 'Risque élevé',
    mediumRisk: 'Risque moyen',
    lowRisk: 'Risque faible',
    noRisk: 'Aucun risque',
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
      fr: frTranslations,
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
