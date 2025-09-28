require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db');

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const equipmentConfigRoutes = require('./routes/equipmentConfigRoutes');
const equipmentFileRoutes = require('./routes/equipmentFileRoutes');
const revisionRoutes = require('./routes/revisionRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceFileRoutes = require('./routes/serviceFileRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const defectRoutes = require('./routes/defectRoutes');
const userRoutes = require('./routes/userRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const logbookRoutes = require('./routes/logbookRoutes');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Konzistentní API endpoints
app.use('/api/customers', customerRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/equipment-configs', equipmentConfigRoutes);
app.use('/api/equipment-files', equipmentFileRoutes); // Konzistentní naming
app.use('/api/service-files', serviceFileRoutes); // Konzistentní naming
app.use('/api/revisions', revisionRoutes);
app.use('/api/services', serviceRoutes); // Opraveno z service-visits na services
app.use('/api/inspections', inspectionRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).json({ status: 'ok', message: 'Database connection is working' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});

module.exports = app;
