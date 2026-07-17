"""Evaluate the trained objection Random Forest with a train/test split.

Reports per-label ROC AUC, F1, and a classification report. Writes
ml/artifacts/evaluation.json.

Usage:
    python evaluate.py
"""

from __future__ import annotations

import json
import os

import pandas as pd
from sklearn.metrics import (
    classification_report,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from features import CATEGORICAL_FEATURES, NUMERIC_FEATURES, OBJECTION_LABELS
from train import build_pipeline

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "data", "synthetic_deals.csv")
ART = os.path.join(HERE, "artifacts")


def main() -> None:
    if not os.path.exists(DATA):
        raise SystemExit(f"Dataset not found at {DATA}. Run generate_synthetic_data.py")

    df = pd.read_csv(DATA)
    X = df[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y = df[OBJECTION_LABELS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=7
    )

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    proba = pipe.predict_proba(X_test)  # list of (n, 2) arrays, one per label
    preds = pipe.predict(X_test)

    results = {"perLabel": {}, "macro": {}}
    aucs, f1s = [], []
    for i, label in enumerate(OBJECTION_LABELS):
        y_true = y_test[label].to_numpy()
        p1 = proba[i][:, 1]
        try:
            auc = float(roc_auc_score(y_true, p1))
        except ValueError:
            auc = float("nan")
        f1 = float(f1_score(y_true, preds[:, i], zero_division=0))
        aucs.append(auc)
        f1s.append(f1)
        results["perLabel"][label] = {
            "rocAuc": round(auc, 4),
            "f1": round(f1, 4),
            "positiveRate": round(float(y_true.mean()), 4),
        }

    results["macro"] = {
        "rocAuc": round(sum(a for a in aucs if a == a) / len(aucs), 4),
        "f1": round(sum(f1s) / len(f1s), 4),
        "nTest": int(len(X_test)),
    }

    os.makedirs(ART, exist_ok=True)
    with open(os.path.join(ART, "evaluation.json"), "w") as f:
        json.dump(results, f, indent=2)

    print(json.dumps(results, indent=2))
    print("\nDetailed per-label report:")
    for i, label in enumerate(OBJECTION_LABELS):
        print(f"\n== {label} ==")
        print(classification_report(y_test[label], preds[:, i], zero_division=0))


if __name__ == "__main__":
    main()
