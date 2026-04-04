import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
from tensorflow import keras

_models_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "models")

def load_data(path):
    return np.load(path)

def train_isolation_forest(X, contamination=0.05):
    model = IsolationForest(contamination=contamination, random_state=42)
    model.fit(X)
    joblib.dump(model, os.path.join(_models_dir, "isolation_forest.pkl"))
    print("Isolation Forest saved.")

def train_lstm(X_sequences, epochs=20, batch_size=32):
    timesteps, features = X_sequences.shape[1], X_sequences.shape[2]
    model = keras.Sequential([
        keras.layers.LSTM(64, return_sequences=True, input_shape=(timesteps, features)),
        keras.layers.LSTM(32, return_sequences=True),
        keras.layers.TimeDistributed(keras.layers.Dense(features)),
    ])
    model.compile(optimizer="adam", loss="mse")
    model.fit(X_sequences, X_sequences, epochs=epochs, batch_size=batch_size, validation_split=0.1)
    model.save(os.path.join(_models_dir, "lstm.h5"))
    print("LSTM saved.")

if __name__ == "__main__":
    X = load_data("ml/baseline_features.npy")
    train_isolation_forest(X)

    X_seq = load_data("ml/baseline_sequences.npy")
    train_lstm(X_seq)
