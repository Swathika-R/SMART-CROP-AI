const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const uploadDir = path.join(__dirname, '../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for audio feedback
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ext name based on original or default to webm
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, 'voice-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow all audio files
  if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.webm') || file.originalname.endsWith('.wav') || file.originalname.endsWith('.bin')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for voice feedback
  }
});

// @route   POST /api/feedback
// @desc    Submit feedback (rating, comment and optional voice recording)
// @access  Private
router.post('/', [auth, upload.single('voice')], async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      // Clean up file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, error: 'Please provide a star rating (1-5).' });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, error: 'Rating must be a number between 1 and 5.' });
    }

    // Fetch user details to get username
    const user = await User.findById(req.user.id);
    const username = user ? user.username : 'Farmer';

    const voiceUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const feedbackRecord = await Feedback.create({
      userId: req.user.id,
      username,
      rating: ratingNum,
      comment: comment || '',
      voiceUrl
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedbackRecord
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: 'Server error, failed to submit feedback.' });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ success: false, error: 'Server error, failed to retrieve feedbacks.' });
  }
});

module.exports = router;
