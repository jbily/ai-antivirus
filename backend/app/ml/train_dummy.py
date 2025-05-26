import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Set random seed for reproducibility
np.random.seed(42)

def generate_dummy_data(n_samples=1000):
    """
    Generate dummy data for training the model
    
    Features:
    - total_open_ports: Number of open ports
    - has_ssh: Whether SSH is open
    - has_http: Whether HTTP is open
    - has_https: Whether HTTPS is open
    - has_ftp: Whether FTP is open
    - has_telnet: Whether Telnet is open
    - has_smb: Whether SMB is open
    - has_rdp: Whether RDP is open
    - has_unusual_ports: Whether unusual ports are open
    - packet_count: Number of packets
    - byte_count: Number of bytes
    - connection_duration: Duration of connection
    - connection_count: Number of connections
    """
    # Generate random features
    data = {
        'total_open_ports': np.random.randint(0, 20, n_samples),
        'has_ssh': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'has_http': np.random.choice([0, 1], n_samples, p=[0.5, 0.5]),
        'has_https': np.random.choice([0, 1], n_samples, p=[0.6, 0.4]),
        'has_ftp': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'has_telnet': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
        'has_smb': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'has_rdp': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'has_unusual_ports': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'packet_count': np.random.randint(10, 10000, n_samples),
        'byte_count': np.random.randint(100, 1000000, n_samples),
        'connection_duration': np.random.uniform(0, 3600, n_samples),
        'connection_count': np.random.randint(1, 100, n_samples),
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Generate target variable (malicious or benign)
    # We'll use a simple rule-based approach to make it somewhat realistic
    y = np.zeros(n_samples)
    
    for i in range(n_samples):
        # Higher risk if telnet is open
        risk = 0.3 if df.loc[i, 'has_telnet'] == 1 else 0
        
        # Higher risk if many open ports
        risk += df.loc[i, 'total_open_ports'] * 0.02
        
        # Higher risk if unusual ports are open
        risk += 0.2 if df.loc[i, 'has_unusual_ports'] == 1 else 0
        
        # Higher risk if both SMB and RDP are open
        risk += 0.3 if df.loc[i, 'has_smb'] == 1 and df.loc[i, 'has_rdp'] == 1 else 0
        
        # Higher risk if high connection count
        risk += df.loc[i, 'connection_count'] * 0.005
        
        # Determine if malicious based on risk
        y[i] = 1 if risk > 0.5 or np.random.random() < risk else 0
    
    return df, y

def train_and_save_model(output_path='ai_model.pkl'):
    """
    Train a dummy model and save it to the specified path
    """
    print("Generating dummy training data...")
    X, y = generate_dummy_data(n_samples=1000)
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Model saved to {output_path}")
    
    return model

if __name__ == "__main__":
    # Train and save the model
    model_path = os.path.join(os.path.dirname(__file__), 'ai_model.pkl')
    train_and_save_model(model_path)
    
    print("\nTo use this model for fine-tuning:")
    print("1. Prepare your real dataset with similar features")
    print("2. Modify this script to load your dataset instead of generating dummy data")
    print("3. Run the script to train and save a new model")
    print("4. The AI-Antivirus application will automatically use the new model")
