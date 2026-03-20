import { Activity, Thermometer, Clock } from 'lucide-react';

export default function DeviceTable({ devices }) {
  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No devices found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-slate-400 border-b border-slate-700/50">
          <tr>
            <th className="pb-4 font-medium px-4">Device ID</th>
            <th className="pb-4 font-medium px-4">Temperature</th>
            <th className="pb-4 font-medium px-4">Status</th>
            <th className="pb-4 font-medium px-4">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 text-slate-300">
          {devices.map((device, idx) => (
            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center font-medium text-white">
                  <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                  {device.id}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 mr-1 text-orange-400" />
                  {device.temperature}
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    device.status === 'Online'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {device.status === 'Online' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
                  )}
                  {device.status}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center text-slate-400">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {device.lastUpdated}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
