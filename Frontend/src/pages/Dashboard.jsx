import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import DeviceTable from '../components/DeviceTable';
import { getDevices } from '../services/api';
import { MonitorSmartphone, Activity, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Fetch dummy devices on mount
    const fetchDevices = async () => {
      const response = await getDevices();
      setDevices(response.data);
    };
    fetchDevices();
  }, []);

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === 'Online').length;
  const alerts = 2; // Dummy stat

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Layout */}
      <div className="flex-col flex-1 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-slate-400 text-sm mt-1">Monitor your IoT ecosystem in real-time</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                title="Total Devices"
                value={totalDevices}
                icon={MonitorSmartphone}
                color="indigo"
              />
              <SummaryCard
                title="Active Now"
                value={activeDevices}
                icon={Activity}
                color="emerald"
              />
              <SummaryCard
                title="Pending Alerts"
                value={alerts}
                icon={AlertCircle}
                color="rose"
              />
            </div>

            {/* Devices Table Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Device Status</h2>
                <button className="text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2 rounded-lg font-medium transition-colors">
                  View All
                </button>
              </div>
              <DeviceTable devices={devices} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
