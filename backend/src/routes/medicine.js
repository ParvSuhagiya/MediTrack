const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Create
router.post('/', auth, async (req, res) => {
  const { name, dosage, frequency, time } = req.body;

  const medicine = await Medicine.create({
    user: req.userId,
    name,
    dosage,
    frequency,
    time,
  });

  res.status(201).json(medicine);
});

// Read all (only this user's medicines)
router.get('/', auth, async (req, res) => {
  const medicines = await Medicine.find({ user: req.userId });
  res.json(medicines);
});

// Update
router.put('/:id', auth, async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(medicine);
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: 'Medicine deleted' });
});

module.exports = router;