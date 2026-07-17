# Saarstahl Objection Model (Python ML Service)

A multi-label **Random Forest** that estimates the probability of each of seven
B2B sales objections, per stakeholder, for a green-steel deal. It is trained on
**100% synthetic data** that encodes plausible green-steel sales dynamics — it
is **not** real customer data and its output is decision support only.

The service is optional. When `MODEL_API_URL` is **not** set, the Next.js app
uses the deterministic rule engine in `lib/prediction-engine.ts`, which mirrors
the same scoring logic used to synthesise the training labels. When
`MODEL_API_URL` **is** set, `app/api/predict/route.ts` calls this service and
falls back automatically if it is unreachable.

## Objection labels

- `price_objection`
- `proof_certification_objection`
- `greenwashing_objection`
- `supply_reliability_objection`
- `internal_approval_objection`
- `technical_quality_objection`
- `low_urgency_objection`

## Files

| File | Purpose |
| --- | --- |
| `features.py` | Shared feature/label schema + stakeholder profiles. Must stay aligned with `lib/feature-engineering.ts` and `lib/stakeholder-profiles.ts`. |
| `generate_synthetic_data.py` | Generates `data/synthetic_deals.csv` (synthetic deals x 4 stakeholders) with probabilistic objection labels. |
| `train.py` | Trains a `MultiOutputClassifier(RandomForestClassifier)` and writes `artifacts/model.pkl` + `artifacts/model_metadata.json`. |
| `evaluate.py` | Computes per-label ROC-AUC / F1 on a hold-out split and writes `artifacts/evaluation.json`. |
| `service.py` | FastAPI app exposing `/health`, `/metadata`, `/predict`. |
| `requirements.txt` | Python dependencies. |

> `artifacts/model.pkl` and `.venv/` are git-ignored (the model is large and
> fully regenerable). Commit `model_metadata.json` and `evaluation.json`.

## Setup & run

```bash
cd ml
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 1. Generate synthetic training data
python generate_synthetic_data.py

# 2. Train the Random Forest
python train.py

# 3. (Optional) Evaluate on a hold-out split
python evaluate.py

# 4. Serve predictions
uvicorn service:app --host 0.0.0.0 --port 8000
```

Then point the Next.js app at the service by setting the environment variable:

```bash
MODEL_API_URL=http://localhost:8000
```

## API

### `GET /health`
```json
{ "status": "ok", "modelVersion": "rf-objection-v1" }
```

### `POST /predict`
Request:
```json
{
  "deal": { "...DealInput fields..." },
  "calculatorOutput": { "...BusinessValueOutput fields..." },
  "stakeholders": ["Procurement", "Sustainability", "Management", "Compliance"]
}
```
Response:
```json
{
  "modelVersion": "rf-objection-v1",
  "dataMode": "synthetic",
  "source": "model-api",
  "predictions": [
    {
      "stakeholder": "Procurement",
      "probabilities": { "price_objection": 0.58, "...": 0.0 },
      "riskLevels": { "price_objection": "Medium", "...": "Low" }
    }
  ]
}
```

`riskLevels` uses the same thresholds as `lib/risk-level.ts`:
`>= 0.70` High, `>= 0.40` Medium, else Low.

## Latest evaluation (synthetic hold-out, nTest = 3000)

Macro ROC-AUC ~0.65, macro F1 ~0.50. Per-label metrics are written to
`artifacts/evaluation.json`. The strongest labels are proof/certification and
greenwashing (ROC-AUC ~0.72-0.74); price and low-urgency are intentionally
noisier because they depend heavily on stakeholder sensitivity.

## Important disclaimer

All figures are modelled on synthetic data. Predictions must never be presented
to customers as validated behaviour, guarantees, or compliance outcomes.
