# Saarstahl Green-Steel Value & Objection Simulator

An internal sales-enablement decision-support tool for **Saarstahl Pure Steel+** (low-emission,
EAF-route steel). Sales teams model the commercial case for a green-steel deal, predict likely
stakeholder objections with a machine-learning model, and generate an evidence-based sales brief.

> **Synthetic-data prototype.** The objection model is trained on synthetically generated deals
> using transparent labelling rules — not real historical CRM outcomes. Predictions are directional
> decision support, not guarantees. Every number in the UI is tagged with its provenance
> (`Calculated`, `Model`, `Fallback`, or `Template`).

## Five-step workflow

1. **Deal input** — customer, industry, material, volumes, prices, emissions intensity, proof/
   certification status, timelines, and a configurable carbon-price assumption. Includes a
   one-click Mercedes example and full field validation.
2. **Business value** — deterministic calculation of green premium (total, per-tonne, per-unit,
   and % vs. conventional), CO2 avoided, an indicative carbon value, and a proof-readiness score.
3. **Predictions** — a Random Forest multi-label model estimates objection likelihood per
   stakeholder (Procurement, Sustainability, Engineering, Management), with per-objection risk
   levels and the contributing feature evidence.
4. **Sales brief** — a structured, provenance-tagged brief (primary objection, recommended opening,
   talking points, evidence to cite, claims to avoid). Deterministic template by default; uses an
   LLM when a provider key is configured.
5. **Saved cases & export** — persist scenarios to `localStorage` and export a full
   provenance-tagged JSON snapshot (deal + features + model outputs + brief).

## Architecture

```
app/
  page.tsx                 5-step workflow orchestrator (client)
  api/predict/route.ts     objection model: RF service if configured, else deterministic fallback
  api/brief/route.ts       sales brief: LLM if key configured, else deterministic template
  api/quote/route.ts       lead-gen quote request handler
lib/
  types.ts                 shared domain model + option constants
  value-calculator.ts      pure business-value math (unit-tested)
  risk-level.ts            probability -> Low/Medium/High thresholds (shared with the model)
  feature-engineering.ts   deal -> model feature rows
  stakeholder-profiles.ts  per-stakeholder concern weights
  prediction-engine.ts     deterministic fallback mirroring the model's label rules
  brief-schema.ts          brief structure + provenance types
  brief-generator.ts       deterministic template brief
  validation.ts            deal validation
  storage.ts / export.ts   saved cases + JSON export
  api-client.ts            typed fetch helpers
ml/                        Python Random Forest service (see ml/README.md)
tests/                     Vitest unit + integration tests
```

### Model serving (separate Python service)

This app deploys as Next.js on Vercel, which cannot run the Python/scikit-learn model in the same
deployment. The trained **Random Forest** is served by a standalone **FastAPI** service in `ml/`.

- Set `MODEL_API_URL` to point the app at the running service; `/api/predict` calls it and tags
  results `Model`.
- When `MODEL_API_URL` is unset or the service is unreachable, `/api/predict` transparently uses
  the deterministic `prediction-engine.ts` fallback (tagged `Fallback`), which shares the same
  label logic and risk thresholds as the trained model so results stay consistent.

See **[`ml/README.md`](./ml/README.md)** to reproduce the dataset, train, evaluate, and run the
service. The trained `model.pkl` binary is intentionally git-ignored (it is large and fully
regenerable via `python train.py`).

## Environment variables

All are optional — the app is fully functional with none set.

| Variable | Purpose | Default behavior when unset |
| --- | --- | --- |
| `MODEL_API_URL` | Base URL of the FastAPI model service | Deterministic fallback engine |
| `OPENAI_API_KEY` | Enables LLM brief generation | Deterministic template brief |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible endpoint | Default OpenAI endpoint |
| `BRIEF_MODEL` | Model id for brief generation | Provider default |

## Getting started

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Optionally run the model service in a second terminal (see `ml/README.md`) and set `MODEL_API_URL`.

## Quality gates

```bash
pnpm lint           # ESLint
pnpm test           # Vitest (37 tests: calculator, risk levels, validation, features, brief, storage)
pnpm build          # Production build
```

## Built with v0

This repository is linked to a [v0](https://v0.app) project. Start new chats to make changes and
v0 will push commits directly to this repo; every merge to `main` auto-deploys.

[Continue working on v0 →](https://v0.app/chat/projects/prj_IdHGhkvrmqmbtsF80XxXREVY4SQ3)
