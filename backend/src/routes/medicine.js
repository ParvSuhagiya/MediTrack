const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/medicines
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, time } = req.body;

    if (!name || !dosage || !frequency || !time) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const medicine = await Medicine.create({
      user: req.userId,
      name,
      dosage,
      frequency,
      time,
    });

    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/medicines
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.userId });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/medicines/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/medicines/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;