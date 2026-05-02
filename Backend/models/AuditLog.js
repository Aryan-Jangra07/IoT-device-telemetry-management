const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, enum: ['DELETE_USER', 'DELETE_DEVICE'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: String, required: true },
  targetType: { type: String, enum: ['User', 'Device'], required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
