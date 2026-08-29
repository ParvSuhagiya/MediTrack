const express = require('express');
const DoseLog = require('../models/DoseLog');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/doselogs
router.post('/', auth, async (req, res) => {
  try {
    let { medicineId, status, photo } = req.body;

    if (!medicineId) {
      return res.status(400).json({ message: 'Medicine is required' });
    }

    if (!status) {
      status = 'taken';
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
    const { medicine, date } = req.query;
    let query = { user: req.userId };

    if (medicine) {
      query.medicine = medicine;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.takenAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const doseLogs = await DoseLog.find(query)
      .populate('medicine', 'name dosage')
      .sort({ takenAt: -1 });

    res.json(doseLogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;