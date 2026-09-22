import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, db, collection, onSnapshot } from './firebase';
import { UserProfile, LaundryService } from './types';
import { seedInitialServicesIfNeeded } from './seedData';
import { Navbar } from './components/Navbar';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Sparkles, Shield, ShoppingBag, ArrowRight, CheckCircle2, Clock, Truck, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [services, setServices] = useState<LaundryService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Admin emails whitelist
  const ADMIN_EMAILS = ['muhammedsinan67835@gmail.com', 'admin@bubbles.com'];

  // Auth State Listener
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.log('Redirect result note:', err);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const isAdmin = ADMIN_EMAILS.includes(email) || email.endsWith('@admin.com');
        
        setUser({
          uid: firebaseUser.uid,
          email: email,
          displayName: firebaseUser.displayName || email.split('@')[0] || 'Customer',
          photoURL: firebaseUser.photoURL || undefined,
          role: isAdmin ? 'admin' : 'customer'
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Services Real-Time Listener & Seeding
  useEffect(() => {
    seedInitialServicesIfNeeded().then(() => {
      const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
        const fetchedServices: LaundryService[] = [];
        snapshot.forEach(docSnap => {
          fetchedServices.push({ id: docSnap.id, ...docSnap.data() } as LaundryService);
        });
        setServices(fetchedServices);
        setServicesLoading(false);
      }, (error) => {
        console.error('Error fetching services:', error);
        setServicesLoading(false);
      });

      return () => unsubscribeServices();
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn('Popup sign in failed, trying redirect:', error);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        console.error('Redirect sign in error:', redirectError);
        alert('Sign-in failed: ' + (redirectError.message || error.message));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('customer');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30 animate-bounce mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <p className="text-slate-600 font-medium">Loading Bubbles & Co. Laundry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-cyan-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="flex-1">
        {!user ? (
          /* Public Landing Page */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-cyan-50 text-cyan-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-cyan-200">
                  <Sparkles className="w-4 h-4" />
                  <span>Next-Generation Laundry & Dry Cleaning</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Immaculate Clothes, <span className="text-cyan-600">Zero Effort.</span>
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  Schedule free pickup and delivery with real-time order tracking. From everyday wash & fold to delicate dry cleaning, we treat your wardrobe with expert care.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleLogin}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center space-x-3 text-base"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In with Google to Book</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 pt-6 border-t border-slate-200/80 gap-4">
                  <div>
                    <p className="text-2xl font-black text-slate-900">24h</p>
                    <p className="text-xs text-slate-500 font-medium">Turnaround Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">Free</p>
                    <p className="text-xs text-slate-500 font-medium">Pickup & Delivery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Satisfaction Guarantee</p>
                  </div>
                </div>
              </div>

              {/* Right preview card / Services snapshot */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                  Live Services
                </div>

                <h3 className="text-xl font-bold text-slate-900">Available Services</h3>

                <div className="space-y-3">
                  {services.slice(0, 4).map(service => (
                    <div key={service.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                        <p className="text-xs text-slate-500">{service.turnaroundTime} turnaround</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900">${service.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block">/{service.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-cyan-50/80 rounded-2xl p-4 flex items-center space-x-3 text-cyan-900 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />
                  <span>Sign in now with your Google account to book your first pickup in seconds.</span>
                </div>
              </div>

            </div>
          </div>
        ) : activeTab === 'admin' && user.role === 'admin' ? (
          <AdminDashboard services={services} />
        ) : (
          <CustomerDashboard user={user} services={services} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Bubbles & Co. Laundry Service. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
