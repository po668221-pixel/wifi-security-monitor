import joblib
import numpy as np
import os

isolation_forest = None
lstm_model = None

_models_dir = os.path.join(os.path.dirname(__file__), "..", "models")

def load_models(if_path=None, lstm_path=None):
    global isolation_forest, lstm_model
    if if_path is None:
        if_path = os.path.join(_models_dir, "isolation_forest.pkl")
    if lstm_path is None:
        lstm_path = os.path.join(_models_dir, "lstm.h5")

    if os.path.exists(if_path):
        try:
            isolation_forest = joblib.load(if_path)
            print(f"[ml] Isolation Forest loaded from {if_path}")
        except Exception as e:
            print(f"[ml] Failed to load Isolation Forest: {e}")
    else:
        print(f"[ml] isolation_forest.pkl not found — skipping IF model")

    if os.path.exists(lstm_path):
        try:
            from tensorflow import keras
            lstm_model = keras.models.load_model(lstm_path)
            print(f"[ml] LSTM loaded from {lstm_path}")
        except Exception as e:
            print(f"[ml] Failed to load LSTM: {e}")
    else:
        print(f"[ml] lstm.h5 not found — skipping LSTM model")

def is_if_loaded() -> bool:
    return isolation_forest is not None

def score_isolation_forest(features: list) -> float:
    x = np.array(features).reshape(1, -1)
    return isolation_forest.decision_function(x)[0]

def score_lstm(sequence: list) -> float:
    x = np.array(sequence).reshape(1, len(sequence), -1)
    reconstruction = lstm_model.predict(x)
    return float(np.mean((x - reconstruction) ** 2))
