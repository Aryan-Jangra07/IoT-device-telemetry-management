const express = require('express');
const router = express.Router();
const { getAdminDevices } = require('../controllers/deviceController');
const { deleteUser, deleteAdminDevice } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Existing route uses standard admin check
router.get('/devices', requireRole('admin'), getAdminDevices);

// New Deletion Routes
// admin required to delete an entire user account
router.delete('/users/:id', requireRole('admin'), deleteUser);

// standard admin clearance to cleanly delete an isolated device
router.delete('/devices/:id', requireRole('admin'), deleteAdminDevice);

module.exports = router;
