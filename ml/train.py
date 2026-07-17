"""Train a multi-label Random Forest to predict stakeholder objection risk.

Usage:
    python generate_synthetic_data.py
    python train.py

Artifacts written to ml/artifacts/:
    - model.pkl          (sklearn Pipeline: preprocessing + RandomForest)
    - model_metadata.json
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from features import CATEGORICAL_FEATURES, NUMERIC_FEATURES, OBJECTION_LABELS

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "data", "synthetic_deals.csv")
ART = os.path.join(HERE, "artifacts")
MODEL_VERSION = "rf-objection-v1"


def build_pipeline() -> Pipeline:
    pre = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("num", StandardScaler(), NUMERIC_FEATURES),
        ]
    )
    clf = MultiOutputClassifier(
        RandomForestClassifier(
            n_estimators=300,
            max_depth=14,
            min_samples_leaf=3,
            n_jobs=-1,
            class_weight="balanced",
            random_state=42,
        )
    )
    return Pipeline([("pre", pre), ("clf", clf)])


def main() -> None:
    if not os.path.exists(DATA):
        raise SystemExit(
            f"Dataset not found at {DATA}. Run: python generate_synthetic_data.py"
        )

    df = pd.read_csv(DATA)
    X = df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y = df[OBJECTION_LABELS]

    pipe = build_pipeline()
    pipe.fit(X, y)

    os.makedirs(ART, exist_ok=True)
    joblib.dump(pipe, os.path.join(ART, "model.pkl"))

    metadata = {
        "modelVersion": MODEL_VERSION,
        "dataMode": "synthetic",
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "algorithm": "RandomForestClassifier (MultiOutput)",
        "nEstimators": 300,
        "maxDepth": 14,
        "labels": OBJECTION_LABELS,
        "categoricalFeatures": CATEGORICAL_FEATURES,
        "numericFeatures": NUMERIC_FEATURES,
        "nTrainingRows": int(len(df)),
        "notice": (
            "Trained on 100% synthetic data encoding plausible B2B green-steel "
            "sales dynamics. Not real customer data. Predictions are decision "
            "support only and must not be presented as validated customer behaviour."
        ),
    }
    with open(os.path.join(ART, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved model + metadata to {ART}")
    print(f"Model version: {MODEL_VERSION}")


if __name__ == "__main__":
    main()
