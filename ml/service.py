"""FastAPI prediction service for the Saarstahl objection Random Forest.

Run locally:
    python generate_synthetic_data.py
    python train.py
    uvicorn service:app --host 0.0.0.0 --port 8000

Then point the Next.js app at it:
    MODEL_API_URL=http://localhost:8000

Contract (matches app/api/predict/route.ts -> tryModelApi):
    POST /predict
    {
      "deal": DealInput,
      "calculatorOutput": BusinessValueOutput,
      "stakeholders": ["Procurement", ...]   # optional
    }
    ->
    {
      "modelVersion": str,
      "dataMode": "synthetic",
      "source": "model-api",
      "predictions": [ { stakeholder, probabilities, riskLevels }, ... ]
    }
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from features import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    OBJECTION_LABELS,
    STAKEHOLDER_PROFILES,
    STAKEHOLDERS,
)

HERE = os.path.dirname(__file__)
ART = os.path.join(HERE, "artifacts")

app = FastAPI(title="Saarstahl Objection Model", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_metadata: dict[str, Any] = {"modelVersion": "rf-objection-v1", "dataMode": "synthetic"}


def load_model():
    global _model, _metadata
    if _model is None:
        model_path = os.path.join(ART, "model.pkl")
        if not os.path.exists(model_path):
            raise RuntimeError(
                "model.pkl not found. Run: python generate_synthetic_data.py && python train.py"
            )
        _model = joblib.load(model_path)
        meta_path = os.path.join(ART, "model_metadata.json")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                _metadata = json.load(f)
    return _model


class PredictRequest(BaseModel):
    deal: Dict[str, Any]
    calculatorOutput: Dict[str, Any]
    stakeholders: Optional[List[str]] = None


def to_risk_level(p: float) -> str:
    # Must mirror lib/risk-level.ts toRiskLevel(): 0.70+ High, 0.40+ Medium.
    if p >= 0.70:
        return "High"
    if p >= 0.40:
        return "Medium"
    return "Low"


def build_row(deal: dict, out: dict, stakeholder: str) -> dict:
    profile = STAKEHOLDER_PROFILES[stakeholder]
    return {
        "stakeholder": stakeholder,
        "industry": deal.get("industry"),
        "materialType": deal.get("materialType"),
        "certificationStatus": deal.get("certificationStatus"),
        "supplyReliability": deal.get("supplyReliability"),
        "technicalQualificationStatus": deal.get("technicalQualificationStatus"),
        "deliveryTimeline": deal.get("deliveryTimeline"),
        "annualSteelVolumeTonnes": deal.get("annualSteelVolumeTonnes", 0),
        "conventionalSteelPricePerTonne": deal.get("conventionalSteelPricePerTonne", 0),
        "greenPremiumPerTonne": deal.get("greenPremiumPerTonne", 0),
        "totalPremium": out.get("totalPremium", 0),
        "premiumPerProduct": out.get("premiumPerProduct", 0),
        "premiumPercentage": out.get("premiumPercentage", 0),
        "baselineCo2Intensity": deal.get("baselineCo2Intensity", 0),
        "greenSteelCo2Intensity": deal.get("greenSteelCo2Intensity", 0),
        "co2Saved": out.get("co2Saved", 0),
        "proofScore": out.get("proofScore", 0),
        "carbonPrice": (deal.get("carbonPrice") or {}).get("value", 0),
        "indicativeCarbonValue": out.get("indicativeCarbonValue", 0),
        **profile,
    }


@app.get("/health")
def health() -> dict:
    try:
        load_model()
        return {"status": "ok", "modelVersion": _metadata.get("modelVersion")}
    except Exception as exc:  # noqa: BLE001
        return {"status": "degraded", "error": str(exc)}


@app.get("/metadata")
def metadata() -> dict:
    load_model()
    return _metadata


@app.post("/predict")
def predict(req: PredictRequest) -> dict:
    model = load_model()
    stakeholders = req.stakeholders or STAKEHOLDERS
    rows = [build_row(req.deal, req.calculatorOutput, s) for s in stakeholders]
    X = pd.DataFrame(rows)[CATEGORICAL_FEATURES + NUMERIC_FEATURES]

    proba = model.predict_proba(X)  # list per label of (n_rows, 2)
    predictions = []
    for r, stakeholder in enumerate(stakeholders):
        probabilities = {}
        risk_levels = {}
        for i, label in enumerate(OBJECTION_LABELS):
            p = float(proba[i][r][1])
            probabilities[label] = round(p, 4)
            risk_levels[label] = to_risk_level(p)
        predictions.append(
            {
                "stakeholder": stakeholder,
                "probabilities": probabilities,
                "riskLevels": risk_levels,
            }
        )

    return {
        "modelVersion": _metadata.get("modelVersion", "rf-objection-v1"),
        "dataMode": "synthetic",
        "source": "model-api",
        "predictions": predictions,
    }
