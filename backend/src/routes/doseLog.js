const express = require('express');
const DoseLog = require('../models/DoseLog');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/doselogs
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, photo } = req.body;

    if (!medicineId || !photo) {
      return res.status(400).json({ message: 'Medicine and photo are required' });
    }

    const doseLog = await DoseLog.create({
      user: req.userId,
      medicine: medicineId,
      photo,
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
      .sort({ takenAt: -1 });

    res.json(doseLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;