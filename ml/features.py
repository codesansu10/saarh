"""Shared feature + label schema for the Saarstahl objection model.

The columns here MUST stay aligned with lib/feature-engineering.ts and the
objection scoring in lib/prediction-engine.ts so the TypeScript deterministic
fallback and the Python Random Forest agree on inputs and outputs.
"""

from __future__ import annotations

OBJECTION_LABELS = [
    "price_objection",
    "proof_certification_objection",
    "greenwashing_objection",
    "supply_reliability_objection",
    "internal_approval_objection",
    "technical_quality_objection",
    "low_urgency_objection",
]

STAKEHOLDERS = ["Procurement", "Sustainability", "Management", "Compliance"]

CATEGORICAL_FEATURES = [
    "stakeholder",
    "industry",
    "materialType",
    "certificationStatus",
    "supplyReliability",
    "technicalQualificationStatus",
    "deliveryTimeline",
]

NUMERIC_FEATURES = [
    "annualSteelVolumeTonnes",
    "conventionalSteelPricePerTonne",
    "greenPremiumPerTonne",
    "totalPremium",
    "premiumPerProduct",
    "premiumPercentage",
    "baselineCo2Intensity",
    "greenSteelCo2Intensity",
    "co2Saved",
    "proofScore",
    "carbonPrice",
    "indicativeCarbonValue",
    "costSensitivity",
    "proofSensitivity",
    "claimRiskSensitivity",
    "strategicFocus",
    "supplySensitivity",
    "technicalSensitivity",
    "urgencySensitivity",
]

FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERIC_FEATURES

# Stakeholder sensitivity profiles. Mirrors lib/stakeholder-profiles.ts.
STAKEHOLDER_PROFILES = {
    "Procurement": {
        "costSensitivity": 0.9,
        "proofSensitivity": 0.5,
        "claimRiskSensitivity": 0.3,
        "strategicFocus": 0.5,
        "supplySensitivity": 0.8,
        "technicalSensitivity": 0.6,
        "urgencySensitivity": 0.5,
    },
    "Sustainability": {
        "costSensitivity": 0.3,
        "proofSensitivity": 0.9,
        "claimRiskSensitivity": 0.85,
        "strategicFocus": 0.7,
        "supplySensitivity": 0.3,
        "technicalSensitivity": 0.4,
        "urgencySensitivity": 0.7,
    },
    "Management": {
        "costSensitivity": 0.6,
        "proofSensitivity": 0.5,
        "claimRiskSensitivity": 0.5,
        "strategicFocus": 0.95,
        "supplySensitivity": 0.6,
        "technicalSensitivity": 0.5,
        "urgencySensitivity": 0.6,
    },
    "Compliance": {
        "costSensitivity": 0.2,
        "proofSensitivity": 0.95,
        "claimRiskSensitivity": 0.95,
        "strategicFocus": 0.4,
        "supplySensitivity": 0.3,
        "technicalSensitivity": 0.7,
        "urgencySensitivity": 0.9,
    },
}
