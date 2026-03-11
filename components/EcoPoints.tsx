import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

interface EcoPointsProps {
    user: User;
}

const EcoPoints: React.FC<EcoPointsProps> = ({ user }) => {
    const [ecoPoints, setEcoPoints] = useState<number>(user.ecoPoints || 0);
    const [discountAvailable, setDiscountAvailable] = useState<boolean>(user.discountAvailable || false);

    useEffect(() => {
        // Immediately update state with current user's initial data
        setEcoPoints(user.ecoPoints || 0);
        setDiscountAvailable(user.discountAvailable || false);

        // Listen for real-time updates to user's point balance
        const userRef = doc(db, 'users', user.id);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEcoPoints(data.ecoPoints || 0);
                setDiscountAvailable(data.discountAvailable || false);
            }
        });

        return () => unsubscribe();
    }, [user.id, user.ecoPoints, user.discountAvailable]);

    const maxPoints = 5;
    const progressPercentage = Math.min((ecoPoints / maxPoints) * 100, 100);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 space-y-8">

            <div className="bg-white rounded-3xl p-8 border border-green-50 shadow-sm overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-green-100 rounded-full opacity-30 blur-xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">

                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Rewards Program
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Eco Points</h2>
                        <p className="text-gray-500 max-w-lg leading-relaxed">
                            Earn <strong className="text-green-700">1 point</strong> for every completed pickup. Get <strong className="text-green-700">20% OFF</strong> when you reach 5 points. Help the environment and save!
                        </p>
                    </div>

                    <div className="flex-1 w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner flex flex-col justify-center items-center gap-4">
                        <div className="text-center">
                            <span className="text-5xl font-black text-green-600 tracking-tighter">{ecoPoints}</span>
                            <span className="text-xl font-bold text-gray-400"> / {maxPoints}</span>
                            <p className="text-xs font-bold text-gray-500 uppercase mt-1">Points Balance</p>
                        </div>

                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <p className="text-sm font-medium text-gray-500 mt-2">
                            {maxPoints - ecoPoints > 0
                                ? `${maxPoints - ecoPoints} more points to unlock a discount!`
                                : 'You have reached the maximum points!'}
                        </p>
                    </div>
                </div>
            </div>

            {discountAvailable && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 shadow-xl shadow-green-200 animate-in slide-in-from-bottom-4 duration-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">20% OFF Available!</h3>
                            <p className="text-green-50 font-medium">You unlocked a discount for your next pickup.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl shadow-md hover:bg-green-50 transition-colors whitespace-nowrap">
                        Schedule Now to Apply
                    </button>
                </div>
            )}

        </div>
    );
};

export default EcoPoints;
