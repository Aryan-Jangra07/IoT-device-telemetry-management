const express = require('express');
const router = express.Router();
const { registerDevice, getDevices, sendCommand, deleteDevice, getTelemetry, getAnalytics } = require('../controllers/deviceController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, deviceSchema } = require('../middleware/validation');

router.use(verifyToken);

// User only routes
router.post('/register', requireRole('user'), validate(deviceSchema), registerDevice);
router.get('/', requireRole('user'), getDevices);
router.get('/stats/analytics', requireRole('user'), getAnalytics);

// Shared or resource-based routes (controller has ownership checks)
router.get('/:id/telemetry', getTelemetry);
router.post('/:id/command', sendCommand);
router.delete('/:id', deleteDevice);

module.exports = router;
