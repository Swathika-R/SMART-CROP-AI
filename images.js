const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ImageAnalysis = require('../models/ImageAnalysis');

// @route   POST /api/images/analyze
// @desc    Upload crop image, run disease detection and save
// @access  Private
router.post('/analyze', [auth, upload.single('image')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload an image file' });
  }

  const cropType = req.body.cropType || 'Default';
  const filePath = req.file.path;
  const scriptPath = path.join(__dirname, '../scripts/analyze_disease.py');
  const pythonPath = process.env.PYTHON_PATH || 'python';
  const args = [scriptPath, filePath, cropType];

  execFile(pythonPath, args, async (error, stdout, stderr) => {
    if (error) {
      console.error('Python execution error:', error);
      console.error('Python stderr:', stderr);
      // Clean up uploaded file if run fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({ success: false, error: 'Disease analysis script execution failed' });
    }

    try {
      const analysisResult = JSON.parse(stdout.trim());
      if (analysisResult.error) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(400).json({ success: false, error: analysisResult.error });
      }

      // Compute public accessible image URL (relative to root domain)
      const imageUrl = `/uploads/${req.file.filename}`;

      // Save to database
      const analysisRecord = await ImageAnalysis.create({
        userId: req.user.id,
        imageUrl: imageUrl,
        cropType: analysisResult.crop,
        detectedDisease: analysisResult.disease,
        severity: analysisResult.severity,
        confidence: analysisResult.confidence,
        treatments: analysisResult.treatments
      });

      res.status(201).json({
        success: true,
        data: analysisRecord
      });
    } catch (e) {
      console.error('Output parse error:', e, 'Raw output:', stdout);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      res.status(500).json({ success: false, error: 'Failed to process disease analysis output' });
    }
  });
});

// @route   GET /api/images/history
// @desc    Get image analysis history for a user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await ImageAnalysis.find({ userId: req.user.id });
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/images/stats/overview
// @desc    Get dashboard metrics for disease detections
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const history = await ImageAnalysis.find({ userId: req.user.id });

    if (history.length === 0) {
      return res.json({
        success: true,
        data: {
          totalDetections: 0,
          criticalDetections: 0,
          mostCommonDisease: 'None',
          healthyCropsPercent: 100
        }
      });
    }

    const totalDetections = history.length;
    let criticalDetections = 0;
    let healthyCount = 0;
    const diseaseCounts = {};

    history.forEach(item => {
      if (item.severity === 'Critical' || item.severity === 'High') {
        criticalDetections++;
      }
      if (item.detectedDisease.toLowerCase().includes('healthy')) {
        healthyCount++;
      } else {
        diseaseCounts[item.detectedDisease] = (diseaseCounts[item.detectedDisease] || 0) + 1;
      }
    });

    const healthyCropsPercent = Math.round((healthyCount / totalDetections) * 100);

    let mostCommonDisease = 'None';
    let maxCount = 0;
    for (const disease in diseaseCounts) {
      if (diseaseCounts[disease] > maxCount) {
        maxCount = diseaseCounts[disease];
        mostCommonDisease = disease.split(' (')[0]; // Simple formatting for screen
      }
    }

    res.json({
      success: true,
      data: {
        totalDetections,
        criticalDetections,
        mostCommonDisease,
        healthyCropsPercent
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/images/:id
// @desc    Get specific analysis detail
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await ImageAnalysis.findById(req.params.id);
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

// @route   DELETE /api/images/:id
// @desc    Delete analysis and image file from server
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await ImageAnalysis.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    if (record.userId !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }

    // Attempt to delete local image file
    if (record.imageUrl.startsWith('/uploads/')) {
      const fileName = record.imageUrl.substring(9);
      const filePath = path.join(__dirname, '../public/uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ImageAnalysis.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image analysis record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
