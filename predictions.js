const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');
const auth = require('../middleware/auth');
const Prediction = require('../models/Prediction');

// @route   POST /api/predictions/crop
// @desc    Get crop prediction and save to history
// @access  Private
router.post('/crop', auth, async (req, res) => {
  const { nitrogen, phosphorus, potassium, temperature, humidity, pH, rainfall, soil_type } = req.body;

  if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !pH || !rainfall) {
    return res.status(400).json({ success: false, error: 'Please enter all soil and climate features' });
  }

  const startTime = Date.now();
  const scriptPath = path.join(__dirname, '../scripts/predict_crop.py');
  const pythonPath = process.env.PYTHON_PATH || 'python';
  const args = [
    scriptPath,
    nitrogen.toString(),
    phosphorus.toString(),
    potassium.toString(),
    temperature.toString(),
    humidity.toString(),
    pH.toString(),
    rainfall.toString(),
    soil_type || 'Loamy'
  ];

  execFile(pythonPath, args, async (error, stdout, stderr) => {
    if (error) {
      console.error('Python execution error:', error);
      console.error('Python stderr:', stderr);
      return res.status(500).json({ success: false, error: 'Prediction script execution failed' });
    }

    try {
      const predictionResult = JSON.parse(stdout.trim());
      if (predictionResult.error) {
        return res.status(400).json({ success: false, error: predictionResult.error });
      }

      const processingTimeMs = Date.now() - startTime;

      // Save prediction to database
      const predictionRecord = await Prediction.create({
        userId: req.user.id,
        soilMetrics: {
          nitrogen: parseFloat(nitrogen),
          phosphorus: parseFloat(phosphorus),
          potassium: parseFloat(potassium),
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          pH: parseFloat(pH),
          rainfall: parseFloat(rainfall),
          soil_type: soil_type || 'Loamy'
        },
        predictedCrop: predictionResult.prediction,
        confidence: predictionResult.confidence,
        processingTimeMs: processingTimeMs
      });

      res.status(201).json({
        success: true,
        data: {
          ...predictionResult,
          _id: predictionRecord._id,
          createdAt: predictionRecord.createdAt,
          processingTimeMs
        }
      });
    } catch (e) {
      console.error('Output parse error:', e, 'Raw output:', stdout);
      res.status(500).json({ success: false, error: 'Failed to process prediction output' });
    }
  });
});

// @route   GET /api/predictions/history
// @desc    Get prediction history for a user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Prediction.find({ userId: req.user.id });
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/predictions/stats/overview
// @desc    Get dashboard metrics for user
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const history = await Prediction.find({ userId: req.user.id });

    if (history.length === 0) {
      return res.json({
        success: true,
        data: {
          totalPredictions: 0,
          mostRecommendedCrop: 'None',
          averageConfidence: 0,
          soilHealthIndex: 'N/A'
        }
      });
    }

    // Calculations
    const totalPredictions = history.length;
    let sumConfidence = 0;
    const cropCounts = {};

    history.forEach(p => {
      sumConfidence += p.confidence;
      cropCounts[p.predictedCrop] = (cropCounts[p.predictedCrop] || 0) + 1;
    });

    const averageConfidence = Math.round((sumConfidence / totalPredictions) * 100) / 100;
    
    let mostRecommendedCrop = 'None';
    let maxCount = 0;
    for (const crop in cropCounts) {
      if (cropCounts[crop] > maxCount) {
        maxCount = cropCounts[crop];
        mostRecommendedCrop = crop;
      }
    }

    // Soil Health Score estimation (based on pH balancing and nutrient ratios)
    let goodPhPredictions = 0;
    history.forEach(p => {
      const ph = p.soilMetrics.pH;
      if (ph >= 6.0 && ph <= 7.5) {
        goodPhPredictions++;
      }
    });
    const phBalanceRatio = Math.round((goodPhPredictions / totalPredictions) * 100);
    let soilHealthIndex = 'Optimal';
    if (phBalanceRatio < 50) soilHealthIndex = 'Needs Amendment';
    else if (phBalanceRatio < 80) soilHealthIndex = 'Adequate';

    res.json({
      success: true,
      data: {
        totalPredictions,
        mostRecommendedCrop,
        averageConfidence,
        soilHealthIndex
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/predictions/:id
// @desc    Get specific prediction detail
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Prediction.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    if (record.userId !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }

    res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/predictions/:id
// @desc    Delete a prediction from history
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await Prediction.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    if (record.userId !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }

    await Prediction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Prediction record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
