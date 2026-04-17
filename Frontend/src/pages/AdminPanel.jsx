import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/api';
import { ShieldCheck, Activity, Users, Server, Search, Filter, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [data, setData] = useState({ devices: [], stats: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await adminService.getAllDevices();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user and all associated devices?")) return;
    try {
      await adminService.deleteUser(userId);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await adminService.deleteDevice(deviceId);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete device');
    }
  };

  const filteredDevices = data.devices.filter(d => {
    const matchesSearch = 
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.deviceId?.toLowerCase().includes(search.toLowerCase()) || 
      d.owner?.email?.toLowerCase().includes(search.toLowerCase());
      
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && d.status === statusFilter;
  });

  const groupedDevices = filteredDevices.reduce((acc, device) => {
    const email = device.owner?.email || 'Unassigned / Unknown';
    if (!acc[email]) acc[email] = [];
    acc[email].push(device);
    return acc;
  }, {});

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative overflow-hidden">
        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/20 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Admin Privileges
            </span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">System Administration</h2>
        </header>

        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-slate-400">Loading admin metrics...</div>
        ) : (
          <div className="space-y-8 relative z-10">
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard icon={Server} label="Total Devices" value={data.stats.totalDevices || 0} color="blue" />
              <StatCard icon={Activity} label="Online Nodes" value={data.stats.onlineDevices || 0} color="emerald" />
              <StatCard icon={Server} label="Offline Nodes" value={data.stats.offlineDevices || 0} color="rose" />
              <StatCard icon={Users} label="Unique Users" value={data.stats.uniqueUsers || 0} color="purple" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="relative group w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search devices, IDs, or owner emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Grouped Device Tables */}
            <div className="space-y-8">
              {Object.keys(groupedDevices).length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                  No devices match your criteria.
                </div>
              ) : (
                Object.entries(groupedDevices).map(([email, clientDevices]) => {
                  const onlineCount = clientDevices.filter(d => d.status === 'online').length;
                  const ownerId = clientDevices[0]?.owner?._id;
                  
                  return (
                    <div key={email} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                      {/* Client Header */}
                      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                            <Users className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                              {email} <span className="text-slate-400 font-normal text-sm ml-1">({clientDevices.length} Devices)</span>
                            </h3>
                            <p className="text-xs font-semibold text-emerald-500 mt-0.5">{onlineCount} Online</p>
                          </div>
                        </div>
                        {ownerId && (
                          <button 
                            onClick={() => handleDeleteUser(ownerId)}
                            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-rose-500/20 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" /> Delete User
                          </button>
                        )}
                      </div>

                      {/* Client Devices Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                            <tr>
                              <th className="py-4 px-6 font-semibold uppercase tracking-widest text-[10px]">Device Name</th>
                              <th className="py-4 px-6 font-semibold uppercase tracking-widest text-[10px]">Device ID</th>
                              <th className="py-4 px-6 font-semibold uppercase tracking-widest text-[10px]">Status</th>
                              <th className="py-4 px-6 font-semibold uppercase tracking-widest text-[10px]">Registered Date</th>
                              <th className="py-4 px-6 font-semibold uppercase tracking-widest text-[10px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {clientDevices.map(device => (
                              <tr key={device.deviceId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                                  {device.name}
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                                  {device.deviceId}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    device.status === 'online'
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                    }`}>
                                    {device.status === 'online' ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                                    )}
                                    {device.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                                  {new Date(device.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <button 
                                    onClick={() => handleDeleteDevice(device.deviceId)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    title="Delete Device"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Subcomponent for stats
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 shadow-sm group hover:-translate-y-1 transition-all duration-300">
      <div className={`p-3 rounded-xl border transition-colors ${colorMap[color]}`}>
         <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
      </div>
    </div>
  );
};

export default AdminPanel;
