// server/routes/ai.js
// Proxies AI energy-decision requests to the Python ML Engine
// and caches the last 10 decisions for the history feed.

const router = require('express').Router();
const axios = require('axios');

const ML_ENGINE = 'http://127.0.0.1:5000';

// Rolling in-memory ring buffer of the last 10 decisions
const decisionHistory = [];
const MAX_HISTORY = 10;

function cacheDecision(decision) {
  decisionHistory.unshift({ ...decision, cachedAt: new Date().toISOString() });
  if (decisionHistory.length > MAX_HISTORY) decisionHistory.pop();
}

// GET /api/ai/energy-decision?irradiance=800&temperature=30&load=35
// POST /api/ai/energy-decision   { irradiance, temperature, load }
router.all('/energy-decision', async (req, res) => {
  try {
    const params = req.method === 'POST' ? {} : req.query;
    const body   = req.method === 'POST' ? req.body : {};

    const mlRes = await axios({
      method: req.method,
      url: `${ML_ENGINE}/api/ai/energy-decision`,
      params,
      data: body,
      timeout: 12000,
    });

    const decision = mlRes.data?.data;
    if (decision) cacheDecision(decision);

    res.json(mlRes.data);
  } catch (err) {
    console.error('AI decision endpoint error:', err.message);
    // Return cached decision if available
    if (decisionHistory.length > 0) {
      return res.json({
        status: 'success',
        source: 'cache',
        data: decisionHistory[0],
      });
    }
    res.status(503).json({
      status: 'error',
      message: 'ML Engine unreachable and no cached decision available.',
    });
  }
});

// GET /api/ai/decision-history — returns last 10 cached decisions
router.get('/decision-history', (req, res) => {
  res.json({ status: 'success', count: decisionHistory.length, data: decisionHistory });
});

// GET /api/ai/context — proxies aggregate-context for frontend inspection
router.get('/context', async (req, res) => {
  try {
    const mlRes = await axios.get(`${ML_ENGINE}/api/ml/aggregate-context`, { timeout: 8000 });
    res.json(mlRes.data);
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'ML Engine unreachable.' });
  }
});

module.exports = router;
