import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { User } from '../types';

interface MainLayoutProps {
    user: User;
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user.name,
        address: user.address || '',
        phone: user.phone || ''
    });

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("Profile updated successfully!");
        setShowProfileModal(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={onLogout} onProfileClick={() => setShowProfileModal(true)} />

            <div className="flex-1">
                <Outlet />
            </div>

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

export default MainLayout;
