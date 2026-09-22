import React, { useState, useEffect } from 'react';
import { LaundryService, LaundryOrder, ServiceCategory } from '../types';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from '../firebase';
import { 
  Shield, Package, DollarSign, Clock, CheckCircle2, AlertCircle, 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter, 
  MapPin, Phone, Mail, User, Sparkles, Check, X
} from 'lucide-react';

interface AdminDashboardProps {
  services: LaundryService[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ services }) => {
  const [adminTab, setAdminTab] = useState<'orders' | 'services'>('orders');
  
  // Orders State
  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Service CRUD State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<LaundryService | null>(null);
  
  // Service Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('per kg');
  const [turnaroundTime, setTurnaroundTime] = useState('24 Hours');
  const [category, setCategory] = useState<ServiceCategory>('Wash & Fold');
  const [icon, setIcon] = useState('Shirt');

  // Fetch all orders in real-time
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders: LaundryOrder[] = [];
      snapshot.forEach(docSnap => {
        allOrders.push({ id: docSnap.id, ...docSnap.data() } as LaundryOrder);
      });
      setOrders(allOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error('Error fetching all orders:', error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: any) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Toggle service availability
  const handleToggleAvailability = async (service: LaundryService) => {
    try {
      await updateDoc(doc(db, 'services', service.id), { available: !service.available });
    } catch (err: any) {
      alert('Failed to update service availability: ' + err.message);
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (err: any) {
      alert('Failed to delete service: ' + err.message);
    }
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const serviceData = {
        name,
        description,
        price: parseFloat(price),
        unit,
        turnaroundTime,
        category,
        available: editingService ? editingService.available : true,
        icon
      };

      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), serviceData);
      } else {
        await addDoc(collection(db, 'services'), serviceData);
      }

      closeServiceModal();
    } catch (err: any) {
      alert('Failed to save service: ' + err.message);
    }
  };

  const openEditModal = (service: LaundryService) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setPrice(service.price.toString());
    setUnit(service.unit);
    setTurnaroundTime(service.turnaroundTime);
    setCategory(service.category);
    setIcon(service.icon);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice('');
    setUnit('per kg');
    setTurnaroundTime('24 Hours');
    setCategory('Wash & Fold');
    setIcon('Shirt');
    setIsServiceModalOpen(false);
  };

  // Statistics calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        order.address.toLowerCase().includes(term)
      );
    }
    return true;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 mr-1" />
              <span>Admin Management Panel</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Facility Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              adminTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Management ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab('services')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              adminTab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Catalog ({services.length})
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{activeOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{completedOrdersCount}</p>
          </div>
        </div>
      </div>

      {adminTab === 'orders' ? (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1">
              {['All', 'Pending', 'Picked Up', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table / List */}
          {loadingOrders ? (
            <div className="py-16 text-center text-slate-400">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-800">No Orders Found</p>
              <p className="text-xs text-slate-400 mt-1">No orders match your current filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Placed: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Recently'}
                      </p>
                    </div>

                    {/* Status Dropdown Updater */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                      <select
                        value={order.status}
                        onChange={e => handleUpdateStatus(order.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Info & Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Info</p>
                      <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <User className="w-4 h-4 text-cyan-600" />
                        <span>{order.customerName}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customerEmail}</span>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Schedule & Address</p>
                      <p className="text-xs text-slate-700"><strong>Pickup:</strong> {order.pickupDate} ({order.pickupSlot})</p>
                      <p className="text-xs text-slate-700"><strong>Delivery:</strong> {order.deliveryDate} ({order.deliverySlot})</p>
                      <p className="text-xs text-slate-700 flex items-start space-x-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{order.address}</span>
                      </p>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl">
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
                        <span>Total: ${order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span>{item.serviceName} x{item.quantity}</span>
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-900">
                      <strong>Special Instructions:</strong> {order.notes}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      ) : (
        /* Services Management Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Laundry Service Catalog Management</h2>
            <button
              onClick={() => { setEditingService(null); setIsServiceModalOpen(true); }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-cyan-600/20 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700">
                      {service.category}
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(service)}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        service.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {service.available ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                      <span>{service.available ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-4">{service.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">{service.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-slate-900">${service.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 ml-1">/{service.unit}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingService ? 'Edit Laundry Service' : 'Add New Laundry Service'}
              </h2>
              <button onClick={closeServiceModal} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Premium Dry Clean"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2.50"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="per kg / per item"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Wash & Fold">Wash & Fold</option>
                    <option value="Dry Cleaning">Dry Cleaning</option>
                    <option value="Ironing">Ironing</option>
                    <option value="Express">Express</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    required
                    placeholder="24 Hours"
                    value={turnaroundTime}
                    onChange={e => setTurnaroundTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of cleaning process..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-cyan-600/20"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
