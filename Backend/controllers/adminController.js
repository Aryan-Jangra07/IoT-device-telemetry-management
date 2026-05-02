const mongoose = require('mongoose');
const User = require('../models/User');
const Device = require('../models/device');
const AuditLog = require('../models/AuditLog');
const { stopSimulation } = require('../services/simulationService');

const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const adminId = req.user.id;

    if (String(adminId) === String(targetId)) {
      return res.status(400).json({ message: "Cannot delete yourself." });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (targetUser.role === 'super_admin') {
      return res.status(400).json({ message: "Cannot delete a super_admin." });
    }

    // Stop simulation for all user devices
    const userDevices = await Device.find({ owner: targetId });
    for (const dev of userDevices) {
      stopSimulation(dev.deviceId);
    }

    await Device.deleteMany({ owner: targetId });
    await User.findByIdAndDelete(targetId);

    await AuditLog.create({
      action: 'DELETE_USER',
      performedBy: adminId,
      targetId: targetId,
      targetType: 'User',
      metadata: { email: targetUser.email, deviceCount: userDevices.length }
    });

    res.status(200).json({ message: "User and associated devices deleted successfully." });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({ message: "Server error during user deletion.", error: error.message });
  }
};

const deleteAdminDevice = async (req, res) => {
  try {
    const targetId = req.params.id;
    const adminId = req.user.id;

    const device = await Device.findOne({ deviceId: targetId });
    if (!device) {
      return res.status(404).json({ message: "Device not found." });
    }

    stopSimulation(device.deviceId);
    await Device.deleteOne({ deviceId: targetId });

    await AuditLog.create({
      action: 'DELETE_DEVICE',
      performedBy: adminId,
      targetId: targetId,
      targetType: 'Device',
      metadata: { deviceName: device.name, owner: device.owner }
    });

    res.status(200).json({ message: "Device deleted successfully." });
  } catch (error) {
    console.error("Admin Delete Device Error:", error);
    res.status(500).json({ message: "Server error during device deletion.", error: error.message });
  }
};

module.exports = { deleteUser, deleteAdminDevice };
