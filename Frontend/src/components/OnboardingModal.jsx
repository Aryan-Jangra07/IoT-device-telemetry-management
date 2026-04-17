import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, X, ArrowRight, CheckCircle2, Box, Sprout, Home, Snowflake, Zap, Server } from 'lucide-react';
import useDeviceStore from '../store/deviceStore';

const DEVICE_TYPES = [
  { id: 'Warehouse Monitoring', icon: Box, telemetry: ['Temperature', 'Humidity'], desc: 'Tracks ambient conditions in storage.' },
  { id: 'Smart Agriculture', icon: Sprout, telemetry: ['Temperature', 'Humidity'], desc: 'Monitors soil and air environments.' },
  { id: 'Smart Home', icon: Home, telemetry: ['Temperature', 'Humidity', 'Voltage'], desc: 'Tracks home automation metrics.' },
  { id: 'Cold Storage', icon: Snowflake, telemetry: ['Temperature'], desc: 'Monitors critical low-temperature parameters.' },
  { id: 'Power Monitoring', icon: Zap, telemetry: ['Voltage'], desc: 'Tracks electrical grid voltage streams.' },
  { id: 'Server Room', icon: Server, telemetry: ['Temperature', 'Humidity', 'Voltage'], desc: 'Data center environmental tracking.' },
];

const OnboardingModal = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceData, setDeviceData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerDevice } = useDeviceStore();

  const handleRegister = async () => {
    if (!deviceName.trim() || !deviceType) return;
    setIsSubmitting(true);
    try {
      const data = await registerDevice(deviceName, deviceType);
      setDeviceData(data.device);
      setStep(4);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold dark:text-white">Device Setup Wizard</h2>
          {step !== 4 && (
            <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl mb-6">
                <Cpu size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-zinc-100 mb-2">Welcome to your Dashboard</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Let's get your IoT device registered and transmitting telemetry data securely.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium transition-all"
              >
                Let's Start <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold dark:text-zinc-100 mb-1">Select Device Type</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  What type of device are you using?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 pb-2">
                {DEVICE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = deviceType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setDeviceType(type.id)}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500' : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-blue-300 dark:hover:border-zinc-600'}`}
                    >
                      <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                      <div className={`font-semibold text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {type.id}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{type.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!deviceType}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all"
                >
                  Next <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold dark:text-zinc-100 mb-1">Name your device</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Give it a recognizable name (e.g., 'Warehouse Sensor #3').
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter device name..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-zinc-600 dark:text-zinc-400 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={!deviceName.trim() || !deviceType || isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isSubmitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </div>
          )}

          {step === 4 && deviceData && (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-6">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Registration Successful!</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                  Configure your physical device with the credentials below to start sending telemetry over MQTT.
                </p>
              </div>
              
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3 relative overflow-hidden">
                <ShieldCheck className="absolute -right-4 -bottom-4 text-zinc-200 dark:text-zinc-700 w-24 h-24 opacity-50 pointer-events-none" />
                <div>
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Device ID / Client ID</div>
                  <div className="font-mono text-sm dark:text-zinc-200">{deviceData.deviceId}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Secure Token (Password)</div>
                  <div className="font-mono text-sm text-amber-600 dark:text-amber-400 break-all">{deviceData.token}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">MQTT Telemetry Topic</div>
                  <div className="font-mono text-sm dark:text-zinc-200">device/{deviceData.deviceId}/telemetry</div>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 mt-2">
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Supported Telemetry</div>
                  <div className="flex flex-wrap gap-2">
                    {DEVICE_TYPES.find(t => t.id === deviceType)?.telemetry.map(metric => (
                      <span key={metric} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs rounded-md font-medium">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs rounded-lg flex gap-2">
                <span className="font-bold">Important:</span> This is the only time your token will be displayed. Please copy it to your device configuration.
              </div>

              <button
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
                className="w-full mt-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
