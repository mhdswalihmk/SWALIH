import React, { useState, useEffect } from 'react';
import { LaundryService, LaundryOrder, OrderItem, ServiceCategory, UserProfile } from '../types';
import { db, collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, Timestamp } from '../firebase';
import { 
  Shirt, Sparkles, Flame, Zap, BedDouble, ShieldCheck, 
  Clock, CheckCircle2, Truck, Package, Plus, Minus, Trash2, 
  Calendar, MapPin, Phone, User, ArrowRight, Check, AlertCircle, ShoppingBag
} from 'lucide-react';

interface CustomerDashboardProps {
  user: UserProfile;
  services: LaundryService[];
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, services }) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'orders'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // Booking Form State
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupSlot, setPickupSlot] = useState('09:00 AM - 12:00 PM');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('02:00 PM - 05:00 PM');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Orders State
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch user orders in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders: LaundryOrder[] = [];
      snapshot.forEach((docSnap) => {
        userOrders.push({ id: docSnap.id, ...docSnap.data() } as LaundryOrder);
      });
      setOrders(userOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Filter services
  const filteredServices = selectedCategory === 'All' 
    ? services.filter(s => s.available)
    : services.filter(s => s.category === selectedCategory && s.available);

  // Cart operations
  const addToCart = (service: LaundryService) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item => 
          item.serviceId === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { serviceId: service.id, serviceName: service.name, price: service.price, quantity: 1 }];
    });
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.serviceId === serviceId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!address || !phone || !pickupDate || !deliveryDate) {
      alert('Please fill in all required delivery and pickup details.');
      return;
    }

    setSubmitting(true);
    try {
      const newOrder: Omit<LaundryOrder, 'id'> = {
        userId: user.uid,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: phone,
        address,
        items: cart,
        totalPrice: calculateTotal(),
        pickupDate,
        pickupSlot,
        deliveryDate,
        deliverySlot,
        status: 'Pending',
        notes: notes.trim() || undefined,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'orders'), newOrder);
      setCart([]);
      setIsBookingOpen(false);
      setSuccessMessage('Order placed successfully! We will pickup your laundry on schedule.');
      setActiveSubTab('orders');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error placing order:', err);
      alert('Failed to place order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled' });
    } catch (err: any) {
      alert('Failed to cancel order: ' + err.message);
    }
  };

  // Helper icon renderer
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="w-6 h-6 text-cyan-600" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'Flame': return <Flame className="w-6 h-6 text-amber-600" />;
      case 'Zap': return <Zap className="w-6 h-6 text-emerald-600" />;
      case 'BedDouble': return <BedDouble className="w-6 h-6 text-indigo-600" />;
      default: return <Shirt className="w-6 h-6 text-cyan-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Picked Up': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-cyan-500/30">
            Welcome back, {user.displayName}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
            Professional Care for Your Wardrobe
          </h1>
          <p className="text-cyan-100/80 mt-2 text-base leading-relaxed">
            Schedule a pickup in seconds. Free collection and delivery right at your doorstep with 24-hour turnaround options.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeSubTab === 'catalog'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Browse Services
            </button>
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 ${
                activeSubTab === 'orders'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>My Orders</span>
              {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {activeSubTab === 'catalog' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Services Catalog */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {(['All', 'Wash & Fold', 'Dry Cleaning', 'Ironing', 'Express', 'Specialty'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredServices.map(service => {
                const inCart = cart.find(item => item.serviceId === service.id);
                return (
                  <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                          {renderServiceIcon(service.icon)}
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                          {service.turnaroundTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-4">{service.name}</h3>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{service.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900">${service.price.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 ml-1">/{service.unit}</span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center space-x-2 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-200">
                          <button 
                            onClick={() => updateQuantity(service.id, -1)}
                            className="text-cyan-700 hover:text-cyan-900 p-1"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-cyan-900 w-4 text-center text-sm">{inCart.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(service.id, 1)}
                            className="text-cyan-700 hover:text-cyan-900 p-1"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(service)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-cyan-600/20 flex items-center space-x-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Cart Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-cyan-600" />
                  <span>Your Order Cart</span>
                </h2>
                <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Select services from the catalog to start your laundry order.</p>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.serviceId} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.serviceName}</p>
                          <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <button onClick={() => updateQuantity(item.serviceId, -1)} className="text-slate-600 hover:text-slate-900">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.serviceId, 1)} className="text-slate-600 hover:text-slate-900">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-slate-900 w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Pickup & Delivery</span>
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total</span>
                      <span className="text-cyan-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Schedule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Orders Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">My Laundry Orders</h2>
            <p className="text-sm text-slate-500">Real-time status updates from our cleaning facility.</p>
          </div>

          {loadingOrders ? (
            <div className="py-16 text-center text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
              <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
              <p className="text-sm text-slate-500 mt-1">You haven't placed any laundry orders yet. Get started today!</p>
              <button
                onClick={() => setActiveSubTab('catalog')}
                className="mt-6 bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-cyan-600/20"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Placed on {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recently'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Bill</p>
                        <p className="text-xl font-black text-slate-900">${order.totalPrice.toFixed(2)}</p>
                      </div>

                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  {order.status !== 'Cancelled' && (
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                        {[
                          { label: 'Pending', step: 1 },
                          { label: 'Picked Up', step: 2 },
                          { label: 'Processing', step: 3 },
                          { label: 'Completed', step: 4 }
                        ].map((s, idx) => {
                          const statusMap: Record<string, number> = {
                            'Pending': 1,
                            'Picked Up': 2,
                            'Processing': 3,
                            'Out for Delivery': 3,
                            'Completed': 4
                          };
                          const currentStep = statusMap[order.status] || 1;
                          const isDone = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;

                          return (
                            <div key={s.label} className="flex flex-col items-center space-y-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isDone ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {isDone ? <Check className="w-4 h-4" /> : s.step}
                              </div>
                              <span className={isCurrent ? 'text-cyan-700 font-bold' : 'text-slate-500'}>{s.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Details</p>
                      <p className="font-medium text-slate-800 mt-1 flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span>{order.pickupDate} ({order.pickupSlot})</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Details</p>
                      <p className="font-medium text-slate-800 mt-1 flex items-center space-x-1.5">
                        <Truck className="w-4 h-4 text-cyan-600" />
                        <span>{order.deliveryDate} ({order.deliverySlot})</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup Address</p>
                      <p className="font-medium text-slate-800 mt-1 flex items-center space-x-1.5 truncate">
                        <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Items</p>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-slate-700">
                          <span>{item.serviceName} <span className="text-slate-400 font-semibold">x{item.quantity}</span></span>
                          <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal / Drawer */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Schedule Pickup & Delivery</h2>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full street address, apartment, suite"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={e => setPickupDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pickup Time Slot</label>
                  <select
                    value={pickupSlot}
                    onChange={e => setPickupSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
                  >
                    <option>08:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 02:00 PM</option>
                    <option>02:00 PM - 05:00 PM</option>
                    <option>05:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Time Slot</label>
                  <select
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
                  >
                    <option>09:00 AM - 12:00 PM</option>
                    <option>12:00 PM - 03:00 PM</option>
                    <option>03:00 PM - 06:00 PM</option>
                    <option>06:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Gate code #1234, leave with front desk, fabric softener preference"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Total Payable Amount</p>
                  <p className="text-xl font-black text-slate-900">${calculateTotal().toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Items in Cart</p>
                  <p className="text-sm font-bold text-cyan-700">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md shadow-cyan-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
