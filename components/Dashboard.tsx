
import React, { useState, useRef, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { User, WastePickup } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [pickups, setPickups] = useState<WastePickup[]>([]);
  const [wasteInput, setWasteInput] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    address: user.address || '',
    phone: user.phone || ''
  });
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Fetch pickups from Firestore
  useEffect(() => {
    const q = query(
      collection(db, `users/${user.id}/pickups`),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pickupData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WastePickup[];
      setPickups(pickupData);
    });
    return () => unsubscribe();
  }, [user.id]);

  // Chart Data preparation
  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pickups.forEach(p => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [pickups]);

  const trendData = React.useMemo(() => {
    return pickups
      .slice()
      .reverse()
      .map(p => ({
        date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: parseFloat(p.weightEstimate || '2.0')
      }));
  }, [pickups]);



  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        // Optionally auto-fill address if you had a reverse geocoding service
        // For now we just let them know location is attached
      },
      (error) => {
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const handleScheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, `users/${user.id}/pickups`), {
        date: formData.get('date') as string,
        type: formData.get('type') as string,
        size: formData.get('size') as string,
        status: 'PENDING',
        address: formData.get('address') as string,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
        weightEstimate: (Math.random() * 5 + 1).toFixed(1)
      });
      setShowScheduleModal(false);
      setCoordinates(null);
    } catch (err) {
      alert("Failed to schedule pickup.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, update this in Firestore 'users' collection
    // For now, we'll just update local state if we were propagating it back up
    // or just show success
    alert("Profile updated successfully!");
    setShowProfileModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-green-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-1.5 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-green-900 tracking-tight">WasteCollection</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Member</span>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-sm font-semibold text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Profile
              </button>
              <button
                onClick={onLogout}
                className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-8">
            {/* Hero & Impact Visualization */}
            <div className="bg-white rounded-3xl p-8 border border-green-50 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Eco Impact Overview</h2>
                  <p className="text-sm text-gray-500">Your waste diversion progress over time.</p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                >
                  Schedule Pickup
                </button>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="kg" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pickup List */}
            <div className="bg-white rounded-3xl shadow-sm border border-green-50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/50">
                <h3 className="text-xl font-bold text-gray-900">Collection Logs</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{pickups.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pickups.map((p) => (
                      <tr key={p.id} className="hover:bg-green-50/20 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-gray-900">{p.date}</td>
                        <td className="px-8 py-5 text-sm text-gray-700">{p.type}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Distribution Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Waste Distribution</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal & FAB (Same as before but linked to Firebase) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Schedule Pickup</h3>
              <button onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-8 space-y-5">
              <input required name="date" type="date" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
              <select name="type" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                <option>Plastic</option>
                <option>Metal</option>
                <option>Glass</option>
                <option>Paper</option>
                <option>Organic</option>
                <option>Electronic</option>
                <option>Hazardous</option>
              </select>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Items Size</label>
                <select name="size" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Address</label>
                <div className="flex gap-2">
                  <input required name="address" type="text" defaultValue={user.address || "123 Green Avenue"} placeholder="Enter pickup address" className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
                  <button type="button" onClick={handleGetLocation} className="whitespace-nowrap px-3 py-3 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 hover:bg-green-100" title="Use Current Location">
                    {isLocating ? 'Locating...' : '📍 GPS'}
                  </button>
                </div>
                {coordinates && <p className="text-xs text-green-600 mt-1">✓ Location attached ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</p>}
              </div>
              <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg">Confirm</button>
            </form>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-green-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Profile</h3>
              <button onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required name="name" type="text" defaultValue={user.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input name="phone" type="tel" placeholder="+1 (555) 000-0000" defaultValue={user.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Default Address</label>
                <input name="address" type="text" placeholder="123 Green St" defaultValue={user.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="w-full px-4 py-3 bg-white border border-green-100 rounded-xl" />
              </div>
              <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg">Save Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
