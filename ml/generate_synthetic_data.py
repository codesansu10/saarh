"""Generate a synthetic, clearly-labelled training dataset for the objection
Random Forest.

IMPORTANT: This data is 100% synthetic. It encodes plausible B2B green-steel
sales dynamics as probabilistic rules; it is NOT real Saarstahl customer data
and must never be presented as validated customer behaviour.

The scoring rules here are the SAME linear/sigmoid rules used by the TypeScript
deterministic fallback in lib/prediction-engine.ts, plus Bernoulli label noise
so the Random Forest has a non-trivial signal to learn.
"""

from __future__ import annotations

import argparse
import math
import os

import numpy as np
import pandas as pd

from features import (
    FEATURE_COLUMNS,
    OBJECTION_LABELS,
    STAKEHOLDER_PROFILES,
    STAKEHOLDERS,
)

INDUSTRIES = [
    "Automotive",
    "Renewable Energy",
    "Infrastructure",
    "Machinery",
    "Construction",
]
MATERIALS = ["Wire Rod", "Bar Steel", "Spring Steel", "Engineering Steel", "Forged Components"]
CERT = ["Certified", "Pending", "Not started", "In audit"]
SUPPLY = ["Low", "Medium", "High"]
TQ = ["Qualified", "In qualification", "Not qualified"]
TIMELINES = [
    "Immediate",
    "Within 3 months",
    "Within 6 months",
    "Within 12 months",
    "Beyond 12 months",
]


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def clamp01(x: float) -> float:
    return min(1.0, max(0.0, x))


def supply_risk_score(supply: str) -> float:
    return {"Low": 1.0, "Medium": 0.55, "High": 0.15}[supply]


def cert_pending(cert: str) -> float:
    return 0.0 if cert == "Certified" else 1.0


def not_qualified(tq: str) -> float:
    return {"Qualified": 0.1, "In qualification": 0.55, "Not qualified": 1.0}[tq]


def timeline_urgency(t: str) -> float:
    return {
        "Immediate": 1.0,
        "Within 3 months": 0.75,
        "Within 6 months": 0.5,
        "Within 12 months": 0.3,
        "Beyond 12 months": 0.15,
    }[t]


def objection_probabilities(row: dict) -> dict:
    """Return the ground-truth objection probabilities for one feature row.

    Mirrors scoreObjections() in lib/prediction-engine.ts exactly.
    """
    premium_pct = row["premiumPercentage"]
    proof_score = row["proofScore"]
    total_premium = row["totalPremium"]

    cp = cert_pending(row["certificationStatus"])
    nq = not_qualified(row["technicalQualificationStatus"])
    tu = timeline_urgency(row["deliveryTimeline"])
    srs = supply_risk_score(row["supplyReliability"])

    # Sharper logits (vs. the softer UI fallback) so the Random Forest has a
    # stronger, more learnable signal under Bernoulli label noise.
    price = -3.0 + 9.0 * premium_pct * row["costSensitivity"] + 1.2 * (1 - row["strategicFocus"])
    proof = -2.4 + 5.5 * (1 - proof_score) * row["proofSensitivity"] + 2.0 * cp * row["proofSensitivity"]
    greenwashing = -2.5 + 5.0 * (1 - proof_score) * row["claimRiskSensitivity"] + 2.4 * cp * row["claimRiskSensitivity"]
    supply = -2.6 + 6.0 * srs * row["supplySensitivity"]
    premium_mag = clamp01(total_premium / 6_000_000.0)
    internal = -2.4 + 4.6 * premium_mag * (1 - row["strategicFocus"]) + 2.6 * premium_pct
    technical = -2.4 + 5.6 * nq * row["technicalSensitivity"]
    low_urgency = -2.2 + 5.2 * (1 - tu) * (1 - row["urgencySensitivity"]) + 1.6 * (1 - row["strategicFocus"])

    raw = {
        "price_objection": price,
        "proof_certification_objection": proof,
        "greenwashing_objection": greenwashing,
        "supply_reliability_objection": supply,
        "internal_approval_objection": internal,
        "technical_quality_objection": technical,
        "low_urgency_objection": low_urgency,
    }
    return {k: clamp01(sigmoid(v)) for k, v in raw.items()}


def make_dataset(n_deals: int, seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows: list[dict] = []

    for _ in range(n_deals):
        industry = rng.choice(INDUSTRIES)
        material = rng.choice(MATERIALS)
        cert = rng.choice(CERT, p=[0.3, 0.35, 0.2, 0.15])
        supply = rng.choice(SUPPLY, p=[0.25, 0.4, 0.35])
        tq = rng.choice(TQ, p=[0.4, 0.4, 0.2])
        timeline = rng.choice(TIMELINES)

        volume = float(rng.integers(500, 40000))
        conv_price = float(rng.integers(600, 950))
        premium_per_t = float(rng.integers(40, 260))
        baseline_co2 = float(rng.uniform(1.6, 2.4))
        green_co2 = float(rng.uniform(0.3, 0.9))
        units = float(rng.integers(50_000, 3_000_000))

        proof_required = int(rng.integers(3, 7))
        proof_available = int(rng.integers(0, proof_required + 1))
        proof_score = proof_available / proof_required if proof_required else 0.0

        total_premium = premium_per_t * volume
        premium_per_product = total_premium / units if units else 0.0
        premium_pct = premium_per_t / conv_price if conv_price else 0.0
        co2_saved = max(0.0, (baseline_co2 - green_co2) * volume)
        carbon_price = 85.0
        indicative_carbon_value = co2_saved * carbon_price

        for stakeholder in STAKEHOLDERS:
            profile = STAKEHOLDER_PROFILES[stakeholder]
            row = {
                "stakeholder": stakeholder,
                "industry": industry,
                "materialType": material,
                "certificationStatus": cert,
                "supplyReliability": supply,
                "technicalQualificationStatus": tq,
                "deliveryTimeline": timeline,
                "annualSteelVolumeTonnes": volume,
                "conventionalSteelPricePerTonne": conv_price,
                "greenPremiumPerTonne": premium_per_t,
                "totalPremium": total_premium,
                "premiumPerProduct": premium_per_product,
                "premiumPercentage": premium_pct,
                "baselineCo2Intensity": baseline_co2,
                "greenSteelCo2Intensity": green_co2,
                "co2Saved": co2_saved,
                "proofScore": proof_score,
                "carbonPrice": carbon_price,
                "indicativeCarbonValue": indicative_carbon_value,
                **profile,
            }
            probs = objection_probabilities(row)
            # Bernoulli sampling around the ground-truth probability => learnable signal + noise.
            for label in OBJECTION_LABELS:
                row[label] = int(rng.random() < probs[label])
            rows.append(row)

    df = pd.DataFrame(rows)
    return df[FEATURE_COLUMNS + OBJECTION_LABELS]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate synthetic objection dataset.")
    parser.add_argument("--deals", type=int, default=4000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--out", type=str, default=os.path.join(os.path.dirname(__file__), "data", "synthetic_deals.csv"))
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    df = make_dataset(args.deals, args.seed)
    df.to_csv(args.out, index=False)
    print(f"Wrote {len(df)} rows ({args.deals} deals x {len(STAKEHOLDERS)} stakeholders) to {args.out}")
    print("Positive label rates:")
    for label in OBJECTION_LABELS:
        print(f"  {label:36s} {df[label].mean():.3f}")


if __name__ == "__main__":
    main()
