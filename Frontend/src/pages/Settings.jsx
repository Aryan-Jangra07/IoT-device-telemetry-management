import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getUser } from '../utils/auth';
import { authService } from '../services/api';
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Database, 
  Bell, 
  Moon,
  Lock,
  Smartphone,
  X
} from 'lucide-react';

const Settings = () => {
  const user = getUser();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError('New passwords do not match');
    }

    if (passwordForm.newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Profile Settings',
      icon: User,
      items: [
        { label: 'Email Address', value: user?.email, type: 'text' },
        { label: 'Account Role', value: user?.role, type: 'badge' },
      ]
    },
    {
      title: 'System Configuration',
      icon: Database,
      items: [
        { label: 'InfluxDB Status', value: 'Connected', type: 'status' },
        { label: 'MQTT Broker', value: 'ws://localhost:1883', type: 'text' },
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        { label: 'Password', value: '••••••••••••', type: 'button', btnLabel: 'Change', action: () => { setSuccess(''); setError(''); setPasswordForm({oldPassword:'', newPassword:'', confirmPassword:''}); setShowPasswordModal(true); } },
        { label: 'Two-Factor Auth', value: 'Disabled', type: 'button', btnLabel: 'Enable' },
      ]
    }
  ];

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 relative overflow-hidden">
        <header className="mb-10 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
              User Preferences
            </span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Settings</h2>
        </header>

        <div className="max-w-4xl space-y-8 relative z-10">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30">
                <section.icon className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-700 dark:text-slate-300">{section.title}</h3>
              </div>
              <div className="p-8 space-y-6">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                      {item.type === 'badge' ? (
                        <span className="bg-blue-600/20 text-blue-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-blue-500/20">
                          {item.value}
                        </span>
                      ) : item.type === 'status' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-400 font-bold text-sm tracking-tight">{item.value}</span>
                        </div>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-semibold">{item.value}</p>
                      )}
                    </div>
                    {item.type === 'button' && (
                      <button 
                        onClick={item.action}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700">
                        {item.btnLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Change Password</h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-500 rounded-xl text-sm font-semibold">{error}</div>}
              {success && <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-500 rounded-xl text-sm font-semibold">{success}</div>}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
