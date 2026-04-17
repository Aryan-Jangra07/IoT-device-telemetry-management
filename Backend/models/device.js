const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Warehouse Monitoring', 'Smart Agriculture', 'Smart Home', 'Cold Storage', 'Power Monitoring', 'Server Room'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true }, // Auto-generated secure key used as an MQTT password
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);