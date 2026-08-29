const express = require('express');
const DoseLog = require('../models/DoseLog');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/doselogs
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, status, photo } = req.body;

    if (!medicineId || !status) {
      return res.status(400).json({ message: 'Medicine and status are required' });
    }

    if (status === 'taken' && !photo) {
      return res.status(400).json({ message: 'Photo is required when status is taken' });
    }

    const doseLog = await DoseLog.create({
      user: req.userId,
      medicine: medicineId,
      status,
      photo: status === 'taken' ? photo : undefined,
    });

    res.status(201).json(doseLog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/doselogs
router.get('/', auth, async (req, res) => {
  try {
    const doseLogs = await DoseLog.find({ user: req.userId })
      .populate('medicine', 'name dosage')
      .sort({ loggedAt: -1 });

    res.json(doseLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/doselogs/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const doseLogs = await DoseLog.find({
      user: req.userId,
      loggedAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate('medicine', 'name dosage');

    res.json(doseLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;