// services/api.jsx
// HELIO Frontend API Layer
// Connects to the Express server at localhost:3001.
// Every function retains its original signature so consuming pages need zero changes.
// Falls back to mock data if the backend is unreachable.

import axios from 'axios';

const EXPRESS_BASE = 'http://localhost:3001/api';
const ML_BASE      = 'http://localhost:5000/api';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const api = axios.create({ baseURL: EXPRESS_BASE, timeout: 8000 });
const ml  = axios.create({ baseURL: ML_BASE,      timeout: 8000 });

/** Returns the value or fallback silently if request throws */
async function safeGet(client, url, params = {}) {
  try {
    const res = await client.get(url, { params });
    return res.data;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// GRID OVERVIEW — Dashboard KPI cards
// ──────────────────────────────────────────────

export const fetchGridOverview = async () => {
  const data = await safeGet(api, '/grid/overview');
  if (data) return data;

  // Fallback mock
  return {
    currentPower:   parseFloat((42 + Math.random() * 4).toFixed(2)),
    todayEnergy:    parseFloat((298 + Math.random() * 40).toFixed(1)),
    monthlyEnergy:  9840,
    todayRevenue:   parseFloat((4200 + Math.random() * 800).toFixed(0)),
    monthlyRevenue: 124380,
    gridEfficiency: parseFloat((85 + Math.random() * 5).toFixed(1)),
    panelsActive:   24,
    panelsFault:    0,
    batteryLevel:   parseFloat((78 + Math.random() * 5).toFixed(1)),
    co2Saved:       4.82,
    uptime:         99.4,
    voltage:        231.4,
    frequency:      50.02,
  };
};

export const fetchLatestTelemetry = async () => {
  const data = await safeGet(api, '/grid/telemetry/latest');
  return data;
};

// ──────────────────────────────────────────────
// POWER SERIES — Real-time + historical chart
// ──────────────────────────────────────────────

export const fetchPowerSeries = async (range = '24H') => {
  const rangeMap = { '24H': '24h', '7D': '7d', '30D': '30d' };
  const data = await safeGet(api, '/grid/series', { range: rangeMap[range] || '24h' });

  if (data && Array.isArray(data) && data.length > 0) {
    return data.map(r => ({
      hour:      new Date(r.timestamp).getHours().toString().padStart(2, '0') + ':00',
      actual:    parseFloat((r.powerKW || 0).toFixed(2)),
      predicted: parseFloat(((r.powerKW || 0) * 1.04).toFixed(2)),
    }));
  }

  // Fallback mock
  const now = new Date();
  const result = [];
  if (range === '24H') {
    for (let h = 0; h <= 23; h++) {
      const base = Math.max(0, -0.19 * (h - 13) ** 2 + 52);
      result.push({
        hour:      `${String(h).padStart(2, '0')}:00`,
        actual:    h <= now.getHours() ? parseFloat((base + (Math.random() - 0.5) * 5).toFixed(2)) : null,
        predicted: parseFloat((base + 1.5).toFixed(2)),
      });
    }
  } else if (range === '7D') {
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach((d, i) => {
      const base = 285 + Math.sin(i / 2) * 50;
      result.push({ hour: d, actual: parseFloat((base + (Math.random() - 0.5) * 40).toFixed(2)), predicted: parseFloat((base + 5).toFixed(2)) });
    });
  } else {
    for (let d = 1; d <= 30; d++) {
      const base = 280 + Math.sin(d / 8) * 60;
      result.push({ hour: `${d}`, actual: parseFloat((base + (Math.random() - 0.5) * 50).toFixed(2)), predicted: parseFloat((base + 8).toFixed(2)) });
    }
  }
  return result;
};

// ──────────────────────────────────────────────
// ENERGY SOLD SERIES — Monthly bar chart
// ──────────────────────────────────────────────

export const fetchEnergySeries = async () => {
  const data = await safeGet(api, '/revenue/summary');
  if (data && Array.isArray(data) && data.length > 0) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return data.map(d => ({
      month:   months[parseInt(d._id?.split('-')[1] || '1', 10) - 1] || d._id,
      energy:  Math.round(d.totalEnergy),
      revenue: Math.round(d.totalRevenue),
    }));
  }
  // Fallback mock
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((month, i) => ({
    month,
    energy:  Math.round(8000 + Math.sin(i / 2) * 2000 + Math.random() * 500),
    revenue: Math.round(110000 + Math.sin(i / 2) * 28000 + Math.random() * 8000),
  }));
};

// ──────────────────────────────────────────────
// WEATHER — Current conditions
// ──────────────────────────────────────────────

export const fetchWeather = async () => {
  const data = await safeGet(api, '/weather/current');
  if (data && data.temp) {
    return {
      icon:      data.icon || '☀️',
      label:     data.condition || 'Clear Sky — Optimal',
      irradiance: data.irradiance || 900,
      cloud:     data.cloudCover || 8,
      temp:      data.temp,
      feelsLike: data.feelsLike,
      humidity:  data.humidity,
      wind:      data.windSpeed,
      uvIndex:   data.uvIndex,
      location:  'Hyderabad, IN',
      forecast: [
        { day: 'Today', icon: '☀️', high: 38, low: 26, irr: 920 },
        { day: 'Tue',   icon: '⛅', high: 36, low: 24, irr: 680 },
        { day: 'Wed',   icon: '☀️', high: 39, low: 27, irr: 940 },
        { day: 'Thu',   icon: '🌤', high: 37, low: 25, irr: 800 },
        { day: 'Fri',   icon: '🌦', high: 33, low: 22, irr: 420 },
      ],
    };
  }
  // Fallback mock
  const conditions = [
    { icon: '☀️', label: 'Clear Sky — Optimal',       irradiance: 920, cloud: 4  },
    { icon: '⛅', label: 'Partly Cloudy — Good',       irradiance: 680, cloud: 35 },
    { icon: '🌤', label: 'Mostly Clear — Very Good',   irradiance: 810, cloud: 18 },
  ];
  const cond = conditions[Math.floor(Math.random() * conditions.length)];
  return {
    ...cond,
    temp:      Math.round(32 + Math.random() * 6),
    feelsLike: Math.round(35 + Math.random() * 5),
    humidity:  Math.round(38 + Math.random() * 20),
    wind:      Math.round(8 + Math.random() * 10),
    uvIndex:   Math.round(7 + Math.random() * 3),
    location:  'Hyderabad, IN',
    forecast: [
      { day: 'Today', icon: '☀️', high: 38, low: 26, irr: 920 },
      { day: 'Tue',   icon: '⛅', high: 36, low: 24, irr: 680 },
      { day: 'Wed',   icon: '☀️', high: 39, low: 27, irr: 940 },
      { day: 'Thu',   icon: '🌤', high: 37, low: 25, irr: 800 },
      { day: 'Fri',   icon: '🌦', high: 33, low: 22, irr: 420 },
    ],
  };
};

// ──────────────────────────────────────────────
// REVENUE REPORT TABLE
// ──────────────────────────────────────────────

export const fetchRevenueReport = async (page = 1, limit = 8) => {
  const data = await safeGet(api, '/revenue', { page, limit });
  if (data?.sessions) return data;

  // Fallback mock
  const sessions = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const energy = parseFloat((15 + Math.random() * 70).toFixed(1));
    const rate = Math.random() > 0.3 ? 15.2 : 14.8;
    const revenue = parseFloat((energy * rate).toFixed(0));
    const hour = Math.max(6, now.getHours() - i * 2);
    sessions.push({
      _id:     `sess_${Date.now()}_${i}`,
      time:    `${String(hour).padStart(2, '00')}:${Math.random() > 0.5 ? '00' : '30'}`,
      energy:  `${energy} kWh`,
      rate:    `₹${rate}`,
      revenue: `₹${revenue.toLocaleString('en-IN')}`,
      status:  Math.random() > 0.2 ? 'pending' : 'settled',
      panel:   `BLOCK-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
    });
  }
  return { sessions, total: 42, page, pages: 6 };
};

// ──────────────────────────────────────────────
// ESTIMATION / FORECAST
// ──────────────────────────────────────────────

export const fetchEstimation = async () => {
  const data = await safeGet(api, '/estimation/forecast');
  if (data?.slots) return data;

  // Fallback mock
  const now = new Date();
  const currentHour = now.getHours();
  const slots = [];
  for (let h = currentHour + 1; h <= 19; h++) {
    const base = Math.max(0, -0.19 * (h - 13) ** 2 + 52);
    const energy = parseFloat((base * 1 + Math.random() * 2).toFixed(1));
    slots.push({
      slot:       `${String(h).padStart(2, '0')}:00 – ${String(h + 1).padStart(2, '0')}:00`,
      power:      `${(base * 0.95).toFixed(1)} kW`,
      energy:     `${energy} kWh`,
      revenue:    `₹${parseFloat((energy * 15.2).toFixed(0))}`,
      confidence: Math.round(88 + Math.random() * 10),
    });
  }
  const totalEst = slots.reduce((s, x) => s + parseFloat(x.energy), 0).toFixed(1);
  const revEst   = slots.reduce((s, x) => s + parseFloat(x.revenue.replace('₹', '')), 0).toFixed(0);
  return {
    slots,
    summary: {
      dayTotalEstimate:   `${totalEst} kWh`,
      dayRevenueEstimate: `₹${parseInt(revEst).toLocaleString('en-IN')}`,
      peakWindow:         '11:00 – 14:00',
      soilingLoss:        '2.1%',
      temperatureLoss:    '0.8%',
      modelConfidence:    '94.2%',
    },
  };
};

// ──────────────────────────────────────────────
// PANEL STATUS
// ──────────────────────────────────────────────

export const fetchPanelStatus = async () => {
  const data = await safeGet(api, '/panels');
  if (data && Array.isArray(data) && data.length > 0) return data;

  // Fallback mock
  return Array.from({ length: 24 }, (_, i) => ({
    id:         `P${String(i + 1).padStart(2, '0')}`,
    block:      `BLOCK-${String.fromCharCode(65 + Math.floor(i / 6))}`,
    power:      parseFloat((380 + Math.random() * 40).toFixed(1)),
    efficiency: parseFloat((88 + Math.random() * 8).toFixed(1)),
    temp:       Math.round(52 + Math.random() * 12),
    status:     Math.random() > 0.08 ? 'active' : 'fault',
  }));
};

// ──────────────────────────────────────────────
// AI ENERGY DECISION — NEW
// ──────────────────────────────────────────────

/**
 * Fetches the current AI energy strategy decision from the backend.
 * @param {object} scenarioOverride - Optional slider values { irradiance, temperature, load }
 * @returns {Promise<object>} Decision object with strategy, reasoning, etc.
 */
export const fetchAIDecision = async (scenarioOverride = null) => {
  try {
    const params = scenarioOverride
      ? { irradiance: scenarioOverride.irradiance, temperature: scenarioOverride.temperature, load: scenarioOverride.load }
      : {};
    const res = await api.get('/ai/energy-decision', { params, timeout: 12000 });
    return res.data?.data || null;
  } catch {
    return null;
  }
};

/**
 * Fetches the last 10 cached AI decisions for a history feed.
 */
export const fetchAIDecisionHistory = async () => {
  try {
    const res = await api.get('/ai/decision-history');
    return res.data?.data || [];
  } catch {
    return [];
  }
};
