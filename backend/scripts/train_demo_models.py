"""
Generates a demo Isolation Forest model for the WiFi Security Monitor.
Run once before starting the backend:

    cd "C:\\Users\\oshiobughie\\Desktop\\second project"
    python -m backend.scripts.train_demo_models
"""
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

np.random.seed(42)

# Simulate "normal" traffic features: [severity(1-4), type(0-3), hour(0-23)]
# Normal = mostly LOW/MEDIUM alerts during business hours
X_normal = np.column_stack([
    np.random.choice([1.0, 2.0], size=400, p=[0.6, 0.4]),
    np.random.choice([0.0, 1.0, 2.0, 3.0], size=400),
    np.random.uniform(8, 20, size=400),
])

# Add a small number of "anomalous" samples: HIGH/CRITICAL at odd hours
X_anomalous = np.column_stack([
    np.random.choice([3.0, 4.0], size=100, p=[0.5, 0.5]),
    np.random.choice([0.0, 1.0, 2.0, 3.0], size=100),
    np.random.uniform(0, 6, size=100),
])

X = np.vstack([X_normal, X_anomalous])

model = IsolationForest(contamination=0.15, random_state=42, n_estimators=100)
model.fit(X)

out_dir = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "isolation_forest.pkl")
joblib.dump(model, out_path)
print(f"Saved demo Isolation Forest model → {os.path.abspath(out_path)}")

# Quick sanity check
normal_sample = [[1.0, 2.0, 14.0]]   # LOW alert, afternoon — should be normal
anomaly_sample = [[4.0, 0.0, 2.0]]   # CRITICAL ARP_SPOOF at 2am — should be anomalous
print(f"Normal sample score:  {model.decision_function(normal_sample)[0]:.4f}  (positive = normal)")
print(f"Anomaly sample score: {model.decision_function(anomaly_sample)[0]:.4f}  (negative = anomalous)")
