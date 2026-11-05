// HELIO decision orchestration.
// ML produces facts, NVIDIA NIM selects from fixed strategies, local policy enforces
// safety, and NVIDIA NIM explains the approved result. No provider can actuate
// a battery, grid connection, or load from this service.

const router = require("express").Router();
const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { DecisionAudit } = require("../models");
const { ML_ENGINE_URL, requestMl } = require("../services/mlClient");
const NVIDIA_API_URL = process.env.NVIDIA_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "openai/gpt-oss-120b";
const CONFIDENCE_THRESHOLD = Number(process.env.NVIDIA_CONFIDENCE_THRESHOLD || 0.75);
const MAX_HISTORY = 25;
const memoryHistory = [];

const STRATEGIES = {
  self_solar: "Meet demand with local solar generation while conditions remain safe.",
  peer_to_peer_trade: "Use verified neighborhood solar surplus before discharging batteries.",
  battery_preservation: "Protect battery reserve and defer flexible demand where possible.",
  grid_import: "Use grid supply because renewable generation and safe battery reserve cannot meet demand.",
  critical_protection: "Protect critical loads and require immediate operator attention.",
};

const URGENCY = {
  normal: "No immediate operating risk.",
  watch: "Conditions should be observed during the next decision window.",
  warning: "An operator should act during this decision window.",
  critical: "Immediate operator attention is required.",
};

function decisionId() {
  return `dec_${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}_${crypto.randomUUID().slice(0, 8)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function summarizeContext(context) {
  const { community, battery, anomalies, predictions, constraints } = context;
  return {
    schemaVersion: context.schemaVersion,
    mode: context.mode,
    observedAt: context.observedAt,
    community: {
      solarPowerKw: community.solarPowerKw,
      loadPowerKw: community.loadPowerKw,
      netPowerKw: community.netPowerKw,
      sharedPowerKw: community.sharedPowerKw,
      gridAvailable: community.gridAvailable,
      gridOutage: community.gridOutage,
    },
    battery: {
      lowestSocPct: battery.lowestSocPct,
      criticalHomeCount: battery.criticalHomeCount,
    },
    predictions,
    anomalies,
    constraints,
  };
}

function validateContext(context) {
  return Boolean(
    context &&
      context.schemaVersion === "1.0" &&
      context.community &&
      Number.isFinite(Number(context.community.netPowerKw)) &&
      context.battery &&
      Number.isFinite(Number(context.battery.lowestSocPct)) &&
      context.constraints
  );
}

function createNvidiaDecisionRequest(context) {
  return {
    model: NVIDIA_MODEL,
    temperature: 0.1,
    max_tokens: 800,
    stream: false,
    reasoning_effort: "low",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are HELIO's structured energy decision engine. Return only valid JSON with exactly these fields: strategy, urgency, operatorReview, confidence. strategy must be one of self_solar, peer_to_peer_trade, battery_preservation, grid_import, critical_protection. urgency must be one of normal, watch, warning, critical. operatorReview must be required or not_required. confidence must be a number from 0 to 1. Use only the supplied state. Do not control hardware.",
      },
      { role: "user", content: JSON.stringify(summarizeContext(context)) },
    ],
  };
}

async function callNvidiaDecision(context) {
  if (!NVIDIA_API_KEY) return null;
  const response = await axios.post(NVIDIA_API_URL, createNvidiaDecisionRequest(context), {
    headers: { Authorization: `Bearer ${NVIDIA_API_KEY}`, "Content-Type": "application/json" },
    timeout: 30000,
  });
  const message = response.data?.choices?.[0]?.message || {};
  const raw = (message.content || message.reasoning_content || response.data?.choices?.[0]?.text || "").trim();
  if (!raw) throw new Error("NVIDIA returned no decision content.");
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const decision = JSON.parse(json);
  if (!STRATEGIES[decision.strategy] || !URGENCY[decision.urgency] || !["required", "not_required"].includes(decision.operatorReview)) {
    throw new Error("NVIDIA returned an invalid decision contract.");
  }
  return {
    strategy: decision.strategy,
    urgency: decision.urgency,
    operatorReview: decision.operatorReview,
    confidence: clamp(decision.confidence, 0, 1),
    providerDecision: decision,
  };
}

function deterministicDecision(context, reason = "provider_unavailable") {
  const { community, battery, anomalies, constraints } = context;
  const highAnomaly = anomalies.highestSeverity === "high";
  const criticalBattery = battery.lowestSocPct < constraints.criticalBatterySocPct;
  const deficit = community.netPowerKw < -0.3;

  if (community.gridOutage && criticalBattery) {
    return { strategy: "critical_protection", urgency: "critical", operatorReview: "required", confidence: 0, reason };
  }
  if (highAnomaly) {
    return { strategy: "critical_protection", urgency: "warning", operatorReview: "required", confidence: 0, reason };
  }
  if (deficit && criticalBattery) {
    return {
      strategy: community.gridAvailable ? "grid_import" : "critical_protection",
      urgency: "warning",
      operatorReview: "required",
      confidence: 0,
      reason,
    };
  }
  if (community.sharedPowerKw > 0.3) {
    return { strategy: "peer_to_peer_trade", urgency: "normal", operatorReview: "not_required", confidence: 0, reason };
  }
  if (deficit) {
    return {
      strategy: "battery_preservation",
      urgency: "watch",
      operatorReview: "not_required",
      confidence: 0,
      reason,
    };
  }
  return { strategy: "self_solar", urgency: "normal", operatorReview: "not_required", confidence: 0, reason };
}

function actionsFor(strategy) {
  const actions = {
    self_solar: [{ type: "prioritize_local_solar", target: "community", requiresApproval: false }],
    peer_to_peer_trade: [{ type: "recommend_p2p_trade", target: "community", requiresApproval: false }],
    battery_preservation: [{ type: "defer_flexible_load", target: "community", requiresApproval: false }],
    grid_import: [{ type: "recommend_grid_import", target: "community", requiresApproval: true }],
    critical_protection: [{ type: "protect_critical_loads", target: "community", requiresApproval: true }],
  };
  return actions[strategy] || actions.battery_preservation;
}

function applySafetyPolicy(candidate, context) {
  const { community, battery, anomalies, constraints } = context;
  const rulesApplied = ["no_automatic_actuation", "minimum_soc_reserve", "p2p_before_battery"];
  let strategy = candidate.strategy;
  let urgency = candidate.urgency;
  let requiresOperatorReview = candidate.operatorReview === "required";
  let outcome = "allowed";

  if (candidate.confidence > 0 && candidate.confidence < CONFIDENCE_THRESHOLD) {
    requiresOperatorReview = true;
    outcome = "manual_review";
    rulesApplied.push("low_provider_confidence");
  }
  if (anomalies.highestSeverity === "high") {
    strategy = "critical_protection";
    urgency = "warning";
    requiresOperatorReview = true;
    outcome = "manual_review";
    rulesApplied.push("high_severity_anomaly");
  }
  if (battery.lowestSocPct < constraints.criticalBatterySocPct && community.netPowerKw < -0.3) {
    strategy = community.gridAvailable ? "grid_import" : "critical_protection";
    urgency = "critical";
    requiresOperatorReview = true;
    outcome = "manual_review";
    rulesApplied.push("critical_battery_protection");
  }
  if (community.gridOutage && battery.lowestSocPct <= constraints.minimumBatterySocPct) {
    strategy = "critical_protection";
    urgency = "critical";
    requiresOperatorReview = true;
    outcome = "manual_review";
    rulesApplied.push("outage_at_minimum_reserve");
  }
  if (["grid_import", "critical_protection"].includes(strategy)) {
    requiresOperatorReview = true;
    outcome = "manual_review";
    rulesApplied.push("approval_required_action");
  }

  return {
    strategy,
    urgency,
    requiresOperatorReview,
    actions: actionsFor(strategy),
    policy: { outcome, rulesApplied },
  };
}

function templateExplanation(decision, context) {
  const { community, battery, anomalies } = context;
  const action = {
    self_solar: "Local solar generation can safely remain the primary supply source.",
    peer_to_peer_trade: "Verified neighborhood solar surplus should cover current deficits before batteries are discharged.",
    battery_preservation: "Available energy should be conserved and flexible loads should be deferred where possible.",
    grid_import: "Grid supply is recommended to protect the configured battery reserve.",
    critical_protection: "Critical loads should be protected and an operator must review the system immediately.",
  }[decision.strategy];
  const anomalyText = anomalies.highestSeverity !== "none" ? ` Active anomaly severity is ${anomalies.highestSeverity}.` : "";
  return `${action} Community solar is ${community.solarPowerKw} kW against ${community.loadPowerKw} kW load, with a ${community.netPowerKw >= 0 ? "surplus" : "deficit"} of ${Math.abs(community.netPowerKw)} kW. The lowest battery state is ${battery.lowestSocPct}%.${anomalyText}`;
}

async function explainWithNvidia(decision, context) {
  if (!process.env.NVIDIA_API_KEY) return { explanation: templateExplanation(decision, context), source: "template_fallback" };
  const compactFacts = {
    strategy: decision.strategy,
    urgency: decision.urgency,
    requiresOperatorReview: decision.requiresOperatorReview,
    community: context.community,
    battery: context.battery,
    anomalies: context.anomalies,
  };
  try {
    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: NVIDIA_MODEL,
        temperature: 0.2,
        max_tokens: 180,
        stream: false,
        messages: [
          {
            role: "system",
            content: "You are HELIO's energy assistant. Explain the already-approved recommendation in plain language in at most 90 words. Use only the supplied facts. Do not invent measurements, change the strategy, promise an action, or use markdown.",
          },
          { role: "user", content: JSON.stringify(compactFacts) },
        ],
      },
      {
        headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`, "Content-Type": "application/json" },
        timeout: 30000,
      },
    );
    const explanation = response.data?.choices?.[0]?.message?.content?.trim();
    if (!explanation) throw new Error("NVIDIA returned no explanation.");
    return { explanation: explanation.slice(0, 800), source: "nvidia_nim" };
  } catch (error) {
    console.warn("NVIDIA explanation fallback:", error.message);
    return { explanation: templateExplanation(decision, context), source: "template_fallback" };
  }
}

async function persistDecision(record) {
  memoryHistory.unshift(record);
  if (memoryHistory.length > MAX_HISTORY) memoryHistory.pop();
  if (mongoose.connection.readyState !== 1) return;
  try {
    await DecisionAudit.create(record);
  } catch (error) {
    console.warn("Decision audit persistence failed:", error.message);
  }
}

async function fetchMlContext(overrides = {}) {
  const response = await requestMl("POST", "/api/ml/context", overrides);
  const context = response?.data;
  if (!validateContext(context)) throw new Error("ML service returned an invalid context contract.");
  return context;
}

async function runDecision(overrides) {
  const context = await fetchMlContext(overrides);
  let providerDecision;
  let source = "nvidia_nim";
  let fallbackUsed = false;
  try {
    providerDecision = await callNvidiaDecision(context);
    if (!providerDecision) {
      fallbackUsed = true;
      source = "deterministic_fallback";
      providerDecision = deterministicDecision(context, "nvidia_key_not_configured");
    }
  } catch (error) {
    console.warn("NVIDIA decision fallback:", error.message);
    fallbackUsed = true;
    source = "deterministic_fallback";
      providerDecision = deterministicDecision(context, "nvidia_unavailable");
  }

  const safeDecision = applySafetyPolicy(providerDecision, context);
  const explanationResult = await explainWithNvidia(safeDecision, context);
  const record = {
    decisionId: decisionId(),
    status: safeDecision.requiresOperatorReview ? "review_required" : "approved",
    source,
    strategy: safeDecision.strategy,
    urgency: safeDecision.urgency,
    confidence: providerDecision.confidence,
    requiresOperatorReview: safeDecision.requiresOperatorReview,
    fallbackUsed,
    contextSnapshot: summarizeContext(context),
    providerDecision: providerDecision.providerDecision || null,
    policy: safeDecision.policy,
    recommendedActions: safeDecision.actions,
    explanation: explanationResult.explanation,
    explanationSource: explanationResult.source,
    generatedAt: new Date().toISOString(),
  };
  await persistDecision(record);
  return record;
}

function toLegacyDecision(record) {
  const strategyMap = {
    self_solar: "BALANCED",
    peer_to_peer_trade: "TRADE",
    battery_preservation: "BATTERY_PRIORITY",
    grid_import: "GRID_IMPORT",
    critical_protection: "GRID_IMPORT",
  };
  const primaryAction = record.recommendedActions[0]?.type?.replaceAll("_", " ") || "hold current operation";
  return {
    strategy: strategyMap[record.strategy] || "BALANCED",
    primary_action: primaryAction.charAt(0).toUpperCase() + primaryAction.slice(1) + ".",
    load_advice: record.requiresOperatorReview ? "Operator approval is required before any control action." : "This is a recommendation only; no equipment is controlled automatically.",
    reasoning: record.explanation,
    confidence: record.confidence,
    expires_minutes: 15,
    override_greedy: record.requiresOperatorReview,
    source: record.source === "nvidia_nim" ? "llm" : "rule_engine",
    operationalDecision: record,
  };
}

router.post("/decide", async (req, res) => {
  try {
    res.json({ status: "success", data: await runDecision(req.body || {}) });
  } catch (error) {
    console.error("Decision endpoint error:", error.message);
    res.status(503).json({ status: "error", message: "ML decision service is unavailable." });
  }
});

// Backward-compatible endpoint consumed by the existing Dashboard and Energy Flow UI.
router.all("/energy-decision", async (req, res) => {
  try {
    const overrides = req.method === "POST" ? req.body || {} : req.query || {};
    const record = await runDecision(overrides);
    res.json({ status: "success", data: toLegacyDecision(record) });
  } catch (error) {
    console.error("Legacy decision endpoint error:", error.message);
    res.status(503).json({ status: "error", message: "ML decision service is unavailable." });
  }
});

router.get("/context", async (req, res) => {
  try {
    res.json({ status: "success", data: await fetchMlContext(req.query || {}) });
  } catch (error) {
    res.status(503).json({ status: "error", message: "ML Engine unreachable." });
  }
});

// Keep the ML service private in cloud deployments. The browser only talks to
// the public API, while this server forwards the request with Cloud Run auth.
router.get("/anomalies/latest", async (_req, res) => {
  try {
    res.json(await requestMl("GET", "/api/ml/anomalies/latest"));
  } catch (error) {
    res.status(503).json({ status: "error", message: "ML anomaly service is unavailable." });
  }
});

router.get("/decisions/latest", async (_req, res) => {
  const latest = mongoose.connection.readyState === 1 ? await DecisionAudit.findOne().sort({ createdAt: -1 }).lean() : memoryHistory[0];
  if (!latest) return res.status(404).json({ status: "error", message: "No decisions have been evaluated yet." });
  res.json({ status: "success", data: latest });
});

router.get("/decisions", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), MAX_HISTORY);
  if (mongoose.connection.readyState !== 1) return res.json({ status: "success", source: "memory", data: memoryHistory.slice(0, limit) });
  const data = await DecisionAudit.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ status: "success", source: "mongodb", data });
});

router.get("/decision-history", async (req, res) => {
  req.query.limit = req.query.limit || "10";
  const limit = Math.min(Math.max(Number(req.query.limit), 1), MAX_HISTORY);
  if (mongoose.connection.readyState !== 1) return res.json({ status: "success", data: memoryHistory.slice(0, limit) });
  const data = await DecisionAudit.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ status: "success", data });
});

router.get("/providers/status", (_req, res) => {
  res.json({
    status: "success",
    data: {
      mlEngineUrlConfigured: Boolean(ML_ENGINE_URL),
      nvidiaConfigured: Boolean(NVIDIA_API_KEY),
      confidenceThreshold: CONFIDENCE_THRESHOLD,
    },
  });
});

module.exports = router;
