import os
import joblib
import random
from typing import Dict, Any, Tuple
import numpy as np

from app.core.config import settings

# Define DummyModel at the top level so it can be found during unpickling
class DummyModel:
    """
    Dummy ML model for demonstration purposes
    """
    def predict_proba(self, X):
        n_samples = len(X) if hasattr(X, '__len__') else 1
        return np.array([[random.uniform(0, 1), random.uniform(0, 1)] for _ in range(n_samples)])
    def predict(self, X):
        probas = self.predict_proba(X)
        return np.argmax(probas, axis=1)

# Check if model exists, if not create a dummy model
if not os.path.exists(settings.MODEL_PATH):
    os.makedirs(os.path.dirname(settings.MODEL_PATH), exist_ok=True)
    dummy_model = DummyModel()
    joblib.dump(dummy_model, settings.MODEL_PATH)
    print(f"Created dummy model at {settings.MODEL_PATH}")

# Load the model
model = joblib.load(settings.MODEL_PATH)

# Define threat types
THREAT_TYPES = [
    "Ransomware",
    "Trojan",
    "Backdoor",
    "Spyware",
    "Worm",
    "Rootkit",
    "Adware",
    "Keylogger",
    "Botnet",
    "Cryptominer",
    "Zero-day Exploit",
    "Malicious Script",
    "Suspicious Network Activity",
    "Unusual Port Usage",
    "Privilege Escalation Attempt"
]

def predict_risk(features: Dict[str, Any]) -> Tuple[float, str]:
    """
    Predict risk score and threat type from features
    
    Args:
        features: Dictionary of features extracted from dataset or host scan
        
    Returns:
        Tuple of (risk_score, threat_type)
    """
    # Convert features to format expected by model
    # In a real implementation, this would involve proper feature extraction
    # For this dummy implementation, we'll just use random features
    X = np.array([[1]])  # Dummy feature vector
    
    # Get prediction probabilities
    probas = model.predict_proba(X)
    
    # Calculate risk score (0-100)
    # Using the probability of being malicious (second column)
    risk_score = float(probas[0][1] * 100)
    
    # Determine threat type based on risk score
    # In a real implementation, this would be based on model output
    if risk_score < 30:
        threat_type = random.choice(THREAT_TYPES[6:]) if risk_score > 10 else None
    elif risk_score < 70:
        threat_type = random.choice(THREAT_TYPES[3:7])
    else:
        threat_type = random.choice(THREAT_TYPES[:3])
    
    return risk_score, threat_type
