const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const ImageAnalysis = require('../models/ImageAnalysis');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        farmDetails: user.farmDetails,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile and farm details
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { username, email, farmDetails } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (farmDetails) {
      updates.farmDetails = {
        location: farmDetails.location !== undefined ? farmDetails.location : user.farmDetails.location,
        size: farmDetails.size !== undefined ? parseFloat(farmDetails.size) : user.farmDetails.size,
        cropTypes: farmDetails.cropTypes !== undefined ? farmDetails.cropTypes : user.farmDetails.cropTypes
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        farmDetails: updatedUser.farmDetails,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Delete prediction records
    const predictions = await Prediction.find({ userId: req.user.id });
    for (const pred of predictions) {
      await Prediction.findByIdAndDelete(pred._id);
    }

    // Delete image records
    const images = await ImageAnalysis.find({ userId: req.user.id });
    for (const img of images) {
      await ImageAnalysis.findByIdAndDelete(img._id);
    }

    await User.findByIdAndDelete(req.user.id);

    res.json({ success: true, message: 'User account and associated data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get agricultural stats counts for admin/user
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalPredictions = (await Prediction.find({ userId: req.user.id })).length;
    const totalDetections = (await ImageAnalysis.find({ userId: req.user.id })).length;

    res.json({
      success: true,
      data: {
        predictionsCount: totalPredictions,
        detectionsCount: totalDetections,
        advisorNotesCount: 2 // Static mock advisor notes count for dashboard visuals
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
