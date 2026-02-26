// services/api.js
// In production, replace BASE_URL with your Express server
// e.g., const BASE_URL = 'http://localhost:5000/api'
// All functions return Promises just like real axios calls

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ——— GRID OVERVIEW ———
export const fetchGridOverview = async () => {
  await delay(600);
  return {
    currentPower: parseFloat((42 + Math.random() * 4).toFixed(2)),  // kW
    todayEnergy:  parseFloat((298 + Math.random() * 40).toFixed(1)), // kWh
    monthlyEnergy: 9840,                                              // kWh
    todayRevenue:  parseFloat((4200 + Math.random() * 800).toFixed(0)),
    monthlyRevenue: 124380,
    gridEfficiency: parseFloat((85 + Math.random() * 5).toFixed(1)),
    panelsActive: 24,
    panelsFault: 0,
    batteryLevel: parseFloat((78 + Math.random() * 5).toFixed(1)),
    co2Saved: 4.82,  // tonnes
    uptime: 99.4,
  };
};

// ——— POWER GENERATION SERIES (24h) ———
export const fetchPowerSeries = async (range = '24h') => {
  await delay(400);
  const now = new Date();
  const currentHour = now.getHours();
  const data = [];

  for (let h = 0; h <= 23; h++) {
    const base = Math.max(0, -0.19 * (h - 13) ** 2 + 52);
    const actual = h <= currentHour ? Math.max(0, base + (Math.random() - 0.5) * 5) : null;
    const predicted = Math.max(0, base + 1.5);
    data.push({
      hour: `${String(h).padStart(2, '0')}:00`,
      actual: actual !== null ? parseFloat(actual.toFixed(2)) : null,
      predicted: parseFloat(predicted.toFixed(2)),
    });
  }
  return data;
};

// ——— ENERGY SOLD SERIES (monthly) ———
export const fetchEnergySeries = async () => {
  await delay(500);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((month, i) => ({
    month,
    energy:  Math.round(8000 + Math.sin(i / 2) * 2000 + Math.random() * 500),
    revenue: Math.round(110000 + Math.sin(i / 2) * 28000 + Math.random() * 8000),
  }));
};

// ——— WEATHER DATA ———
export const fetchWeather = async () => {
  await delay(700);
  const conditions = [
    { icon: '☀️', label: 'Clear Sky — Optimal',    irradiance: 920, cloud: 4  },
    { icon: '⛅', label: 'Partly Cloudy — Good',   irradiance: 680, cloud: 35 },
    { icon: '🌤', label: 'Mostly Clear — Very Good', irradiance: 810, cloud: 18 },
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
      { day: 'Today',   icon: '☀️', high: 38, low: 26, irr: 920 },
      { day: 'Tue',     icon: '⛅', high: 36, low: 24, irr: 680 },
      { day: 'Wed',     icon: '☀️', high: 39, low: 27, irr: 940 },
      { day: 'Thu',     icon: '🌤', high: 37, low: 25, irr: 800 },
      { day: 'Fri',     icon: '🌦', high: 33, low: 22, irr: 420 },
    ]
  };
};

// ——— REVENUE REPORT TABLE ———
export const fetchRevenueReport = async (page = 1, limit = 8) => {
  await delay(500);
  const sessions = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const energy = parseFloat((15 + Math.random() * 70).toFixed(1));
    const rate   = Math.random() > 0.3 ? 15.2 : 14.8;
    const revenue = parseFloat((energy * rate).toFixed(0));
    const hour = Math.max(6, now.getHours() - i * 2);
    sessions.push({
      _id:      `sess_${Date.now()}_${i}`,
      time:     `${String(hour).padStart(2,'0')}:${Math.random() > 0.5 ? '00':'30'}`,
      energy:   `${energy} kWh`,
      rate:     `₹${rate}`,
      revenue:  `₹${revenue.toLocaleString('en-IN')}`,
      status:   hour < now.getHours() - 2 ? 'settled' : Math.random() > 0.2 ? 'pending' : 'settled',
      panel:    `BLOCK-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
    });
  }
  return { sessions, total: 42, page, pages: 6 };
};

// ——— POWER ESTIMATION ———
export const fetchEstimation = async () => {
  await delay(600);
  const now = new Date();
  const currentHour = now.getHours();
  const slots = [];
  for (let h = currentHour + 1; h <= 19; h++) {
    const base = Math.max(0, -0.19 * (h - 13) ** 2 + 52);
    const energy = parseFloat((base * 1 + Math.random() * 2).toFixed(1));
    const rev    = parseFloat((energy * 15.2).toFixed(0));
    slots.push({
      slot:    `${String(h).padStart(2,'0')}:00 – ${String(h+1).padStart(2,'0')}:00`,
      power:   `${(base * 0.95).toFixed(1)} kW`,
      energy:  `${energy} kWh`,
      revenue: `₹${rev}`,
      confidence: Math.round(88 + Math.random() * 10),
    });
  }
  const totalEst  = slots.reduce((s, x) => s + parseFloat(x.energy), 0).toFixed(1);
  const revEst    = slots.reduce((s, x) => s + parseFloat(x.revenue.replace('₹','')), 0).toFixed(0);
  return {
    slots,
    summary: {
      dayTotalEstimate:    `${totalEst} kWh`,
      dayRevenueEstimate:  `₹${parseInt(revEst).toLocaleString('en-IN')}`,
      peakWindow:          '11:00 – 14:00',
      soilingLoss:         '2.1%',
      temperatureLoss:     '0.8%',
      modelConfidence:     '94.2%',
    }
  };
};

// ——— PANEL STATUS ———
export const fetchPanelStatus = async () => {
  await delay(400);
  return Array.from({ length: 24 }, (_, i) => ({
    id:         `P${String(i + 1).padStart(2, '0')}`,
    block:      `BLOCK-${String.fromCharCode(65 + Math.floor(i / 6))}`,
    power:      parseFloat((380 + Math.random() * 40).toFixed(1)),
    efficiency: parseFloat((88 + Math.random() * 8).toFixed(1)),
    temp:       Math.round(52 + Math.random() * 12),
    status:     Math.random() > 0.08 ? 'active' : 'fault',
  }));
};
