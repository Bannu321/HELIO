// server/routes/weather.js
const router  = require('express').Router();
const { Weather } = require('../models');
const axios = require('axios');

// GET /api/weather/current — fetch from OpenWeatherMap + store in MongoDB
router.get('/current', async (req, res) => {
  try {
    // Pull latest cached reading < 10 min old
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const cached = await Weather.findOne({ timestamp: { $gte: tenMinAgo } }).sort({ timestamp: -1 });
    if (cached) return res.json(cached);

    // Fetch fresh from OpenWeatherMap
    const { OWM_API_KEY, LAT = '17.3850', LON = '78.4867' } = process.env;
    if (!OWM_API_KEY) {
      // Return mock data if no API key configured
      return res.json({
        temp: 34, feelsLike: 38, humidity: 42, windSpeed: 12,
        uvIndex: 9, cloudCover: 8, irradiance: 920,
        condition: 'Clear', icon: '☀️', source: 'mock',
      });
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OWM_API_KEY}&units=metric`;
    const { data } = await axios.get(url);

    const entry = await Weather.create({
      temp:       Math.round(data.main.temp),
      feelsLike:  Math.round(data.main.feels_like),
      humidity:   data.main.humidity,
      windSpeed:  Math.round(data.wind.speed * 3.6), // m/s → km/h
      uvIndex:    data.uvi ?? 8,
      cloudCover: data.clouds.all,
      irradiance: Math.round((1 - data.clouds.all / 100) * 1000),
      condition:  data.weather[0].main,
      icon:       data.weather[0].icon,
      source:     'OpenWeatherMap',
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/history?days=7
router.get('/history', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    const records = await Weather.find({ timestamp: { $gte: since } }).sort({ timestamp: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// ——————————————————————————————————————————

// server/routes/panels.js (inline as separate module file below)
