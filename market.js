const express = require('express');
const router = express.Router();

// Mock Agricultural Market Data Engine
const CROPS = ['Rice', 'Wheat', 'Cotton', 'Maize', 'Tomato', 'Onion', 'Potato', 'Soyabean', 'Sugarcane', 'Mustard'];
const STATES = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal'];

function getRandomPrice(base) {
  const variation = (Math.random() - 0.5) * 0.15; // +/- 7.5% variation
  return Math.round(base * (1 + variation));
}

const CROP_PRICE_BASES = {
  'Rice': { base: 2200, unit: 'Quintal', category: 'Cereals' },
  'Wheat': { base: 2125, unit: 'Quintal', category: 'Cereals' },
  'Cotton': { base: 6620, unit: 'Quintal', category: 'Commercial' },
  'Maize': { base: 1960, unit: 'Quintal', category: 'Cereals' },
  'Tomato': { base: 1500, unit: 'Quintal', category: 'Vegetables' },
  'Onion': { base: 1800, unit: 'Quintal', category: 'Vegetables' },
  'Potato': { base: 1200, unit: 'Quintal', category: 'Vegetables' },
  'Soyabean': { base: 4300, unit: 'Quintal', category: 'Oilseeds' },
  'Sugarcane': { base: 315, unit: 'Quintal', category: 'Commercial' },
  'Mustard': { base: 5450, unit: 'Quintal', category: 'Oilseeds' }
};

// @route   GET /api/market/prices
// @desc    Get real-time market prices
// @access  Public
router.get('/prices', (req, res) => {
  const pricesList = [];
  
  STATES.forEach(state => {
    // Each state grows 4-5 random crops from the list
    const stateSeed = state.charCodeAt(0) + state.charCodeAt(1);
    let cropIndex = stateSeed % CROPS.length;
    
    for (let i = 0; i < 4; i++) {
      const crop = CROPS[(cropIndex + i) % CROPS.length];
      const baseInfo = CROP_PRICE_BASES[crop];
      
      pricesList.push({
        id: `${state.toLowerCase()}-${crop.toLowerCase()}`,
        state: state,
        crop: crop,
        category: baseInfo.category,
        minPrice: getRandomPrice(baseInfo.base * 0.9),
        maxPrice: getRandomPrice(baseInfo.base * 1.1),
        modalPrice: getRandomPrice(baseInfo.base),
        unit: baseInfo.unit,
        updatedAt: new Date().toISOString()
      });
    }
  });

  res.json({ success: true, count: pricesList.length, data: pricesList });
});

// @route   GET /api/market/trends
// @desc    Get price trend analysis
// @access  Public
router.get('/trends', (req, res) => {
  // Generate 6 months historical trend data for key crops
  const trends = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  Object.keys(CROP_PRICE_BASES).forEach(crop => {
    const base = CROP_PRICE_BASES[crop].base;
    let currentVal = base * 0.95;
    
    trends[crop] = months.map((month, idx) => {
      // Simulate price changing monthly
      const monthlyFluctuation = 1 + ((idx * 0.02) + (Math.sin(idx) * 0.05));
      const price = Math.round(currentVal * monthlyFluctuation);
      return {
        month,
        price
      };
    });
  });

  res.json({ success: true, data: trends });
});

// @route   GET /api/market/demand-forecast
// @desc    Get demand forecast and sentiment scores
// @access  Public
router.get('/demand-forecast', (req, res) => {
  const forecasts = Object.keys(CROP_PRICE_BASES).map(crop => {
    const baseInfo = CROP_PRICE_BASES[crop];
    
    // Seeded random for consistency
    const seed = crop.charCodeAt(0) + crop.charCodeAt(1);
    const demandIndex = 50 + (seed % 45); // score between 50 and 95
    const supplyIndex = 40 + ((seed * 7) % 55); // score between 40 and 95
    
    let sentiment = 'Stable';
    if (demandIndex - supplyIndex > 15) sentiment = 'Bullish (Rising Demand)';
    else if (supplyIndex - demandIndex > 15) sentiment = 'Bearish (High Supply)';

    const projectedPriceChangePercent = Math.round(((demandIndex - supplyIndex) / 10) * 100) / 100;

    return {
      crop,
      category: baseInfo.category,
      demandScore: demandIndex,
      supplyScore: supplyIndex,
      marketSentiment: sentiment,
      projectedChangePercent: projectedPriceChangePercent,
      confidenceScore: 75 + (seed % 21) // 75% to 95%
    };
  });

  res.json({ success: true, data: forecasts });
});

// @route   GET /api/market/weather-impact
// @desc    Get weather impact analysis on market prices
// @access  Public
router.get('/weather-impact', (req, res) => {
  const impacts = [
    {
      region: 'North India (Punjab, Haryana)',
      condition: 'Delayed Monsoon Rains',
      severity: 'Medium',
      cropAffected: 'Rice',
      impactDetails: 'Delayed sowing leading to expected supply compression. Short-term price spikes likely for early varieties.',
      priceDirection: 'Upward',
      priceChangePercent: 4.5
    },
    {
      region: 'Western India (Maharashtra, Gujarat)',
      condition: 'Excessive Rain in Pockets',
      severity: 'High',
      cropAffected: 'Onion',
      impactDetails: 'Harvest storage damages reported. Sizable supply reduction forecasted in Lasalgaon market.',
      priceDirection: 'Sharp Upward',
      priceChangePercent: 18.2
    },
    {
      region: 'South India (Karnataka, Tamil Nadu)',
      condition: 'Optimal Soil Moisture & Regular Rains',
      severity: 'Low',
      cropAffected: 'Cotton',
      impactDetails: 'Excellent growth and bumper harvest expected. Supply levels will exceed last year, stabilizing market pricing.',
      priceDirection: 'Stable / Downward',
      priceChangePercent: -2.5
    }
  ];

  res.json({ success: true, data: impacts });
});

module.exports = router;
