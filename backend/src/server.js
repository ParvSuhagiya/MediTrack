require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicine');
const doseLogRoutes = require('./routes/doseLog');
const appointmentRoutes = require('./routes/appointment');

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/doselogs', doseLogRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});