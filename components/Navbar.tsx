import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
    user: User;
    onLogout: () => void;
    onProfileClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onProfileClick }) => {
    return (
        <nav className="bg-white border-b border-green-100 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-600 p-1.5 rounded-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-green-900 tracking-tight">Greenscrap</span>
                        </div>

                        <div className="hidden sm:flex items-center space-x-2 ml-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                    }`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/collection-logs"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                    }`
                                }
                            >
                                Collection Logs
                            </NavLink>
                            <NavLink
                                to="/eco-points"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${isActive
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                    }`
                                }
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Eco Points
                            </NavLink>
                            <NavLink
                                to="/complaints"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${isActive
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                                    }`
                                }
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                                Complaints
                            </NavLink>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Member</span>
                            <span className="text-sm font-medium text-gray-700">{user.name}</span>
                        </div>
                        <button
                            onClick={onProfileClick}
                            className="text-sm font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-xl transition-colors duration-200"
                        >
                            Profile
                        </button>
                        <button
                            onClick={onLogout}
                            className="text-sm font-semibold text-red-600 hover:bg-red-50 hover:shadow-sm px-4 py-2 rounded-xl transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
