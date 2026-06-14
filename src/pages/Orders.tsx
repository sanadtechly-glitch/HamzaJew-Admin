import React, { useEffect, useState } from 'react';
import { api, type Order } from '../services/api';
import { 
  ShoppingBag, 
  Phone, 
  User, 
  AlertCircle, 
  Search, 
  Image as ImageIcon, 
  DollarSign, 
  MapPin, 
  Truck, 
  CheckCircle, 
  ExternalLink,
  Calendar,
  CreditCard,
  Layers,
  Scale
} from 'lucide-react';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');

  // Modal for receipt preview
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  // Edit states for changing status
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل طلبات الشراء. يرجى التحقق من اتصالك بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string) => {
    setIsSaving(true);
    try {
      await api.updateOrderStatus(id, selectedStatus, selectedPaymentStatus);
      alert('تم تحديث حالة الطلب والمدفوعات بنجاح');
      setUpdatingId(null);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الطلب');
    } finally {
      setIsSaving(false);
    }
  };

  const startUpdating = (order: Order) => {
    setUpdatingId(order.id);
    setSelectedStatus(order.status);
    setSelectedPaymentStatus(order.paymentStatus);
  };

  // Translation helpers
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار';
      case 'PAID': return 'تم الدفع / قيد التجهيز';
      case 'SHIPPED': return 'تم الشحن / مع المندوب';
      case 'COMPLETED': return 'مكتمل / تم التسليم';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'COD': return 'الدفع عند الاستلام (كاش)';
      case 'BANK_TRANSFER': return 'تحويل بنكي / صك';
      case 'CARD': return 'بطاقة مصرفية (إلكتروني)';
      default: return method;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'معلق / لم يدفع';
      case 'COMPLETED': return 'تم الدفع بنجاح';
      case 'FAILED': return 'فشلت عملية الدفع';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200/50';
      case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200/50';
      default: return 'bg-gray-50 text-gray-700 border-gray-200/50';
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchLower) ||
      order.phone.includes(search) ||
      order.id.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesPayment = paymentMethodFilter === 'ALL' || order.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate high level aggregates
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const processingOrdersCount = orders.filter(o => o.status === 'PAID').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل طلبات الشراء للعملاء...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-brand-dark/50 font-bold block mb-1">إجمالي طلبات الشراء</span>
            <span className="text-xl font-black text-brand-emerald">{totalOrdersCount} طلب</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-brand-dark/50 font-bold block mb-1">طلبات قيد الانتظار</span>
            <span className="text-xl font-black text-amber-600">{pendingOrdersCount} طلب</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-brand-dark/50 font-bold block mb-1">قيد التجهيز / مدفوعة</span>
            <span className="text-xl font-black text-blue-600">{processingOrdersCount} طلب</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-brand-dark/50 font-bold block mb-1">الطلبات المكتملة</span>
            <span className="text-xl font-black text-emerald-600">{completedOrdersCount} طلب</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-brand-dark/40" />
            <input
              type="text"
              placeholder="البحث برقم الطلب، اسم العميل، الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm bg-brand-bg/50 border border-brand-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-dark/50 font-bold shrink-0">طريقة الدفع:</span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-brand-bg border border-brand-gold/20 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                <option value="ALL">الكل</option>
                <option value="COD">الدفع عند الاستلام</option>
                <option value="BANK_TRANSFER">تحويل بنكي</option>
                <option value="CARD">بطاقة مصرفية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab-like pills for Order status */}
        <div className="flex gap-1.5 overflow-x-auto shrink-0 pb-2 border-t border-brand-gold/10 pt-3">
          {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition shrink-0 cursor-pointer ${
                statusFilter === st 
                  ? 'bg-brand-emerald text-brand-gold shadow' 
                  : 'bg-brand-bg hover:bg-brand-gold/10 text-brand-dark/70 border border-brand-gold/10'
              }`}
            >
              {st === 'ALL' && 'الكل'}
              {st === 'PENDING' && 'قيد الانتظار'}
              {st === 'PAID' && 'تم الدفع / للتجهيز'}
              {st === 'SHIPPED' && 'تم الشحن'}
              {st === 'COMPLETED' && 'مكتمل'}
              {st === 'CANCELLED' && 'ملغي'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-gold/15 p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-brand-gold mx-auto mb-2 opacity-50" />
            <p className="text-sm text-brand-dark/50 font-bold">لا توجد طلبات شراء تطابق خيارات التصفية الحالية.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order.id}
              className="bg-white rounded-xl border border-brand-gold/15 shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-brand-bg/40 px-5 py-4 border-b border-brand-gold/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-mono font-black text-brand-gold">طلب #{order.id.substring(0, 8).toUpperCase()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      الدفع: {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                  <div className="text-[10px] text-brand-dark/50 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-gold" />
                    <span>تاريخ الطلب: {new Date(order.createdAt).toLocaleString('ar-LY')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {updatingId === order.id ? (
                    <div className="flex items-center gap-2 bg-brand-bg p-2 rounded-lg border border-brand-gold/25">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-brand-dark/55 font-bold">حالة الطلب:</label>
                        <select 
                          value={selectedStatus} 
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="bg-white border border-brand-gold/25 rounded p-1 text-[11px] font-bold"
                        >
                          <option value="PENDING">قيد الانتظار</option>
                          <option value="PAID">تم الدفع / للتجهيز</option>
                          <option value="SHIPPED">تم الشحن / المندوب</option>
                          <option value="COMPLETED">مكتمل / تم التسليم</option>
                          <option value="CANCELLED">ملغي</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-brand-dark/55 font-bold">حالة الدفع:</label>
                        <select 
                          value={selectedPaymentStatus} 
                          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                          className="bg-white border border-brand-gold/25 rounded p-1 text-[11px] font-bold"
                        >
                          <option value="PENDING">معلق</option>
                          <option value="COMPLETED">مكتمل</option>
                          <option value="FAILED">فاشل</option>
                        </select>
                      </div>

                      <div className="flex gap-1 mt-3.5 self-end">
                        <button
                          onClick={() => handleUpdateStatus(order.id)}
                          disabled={isSaving}
                          className="px-2.5 py-1 bg-brand-emerald text-brand-gold font-bold text-[10px] rounded hover:bg-brand-emerald/90 transition cursor-pointer"
                        >
                          {isSaving ? 'حفظ...' : 'حفظ'}
                        </button>
                        <button
                          onClick={() => setUpdatingId(null)}
                          disabled={isSaving}
                          className="px-2.5 py-1 bg-gray-200 text-brand-dark font-bold text-[10px] rounded hover:bg-gray-300 transition cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startUpdating(order)}
                      className="px-3.5 py-1.5 border border-brand-gold/40 hover:bg-brand-gold/10 text-brand-emerald font-black text-xs rounded-lg transition cursor-pointer"
                    >
                      تحديث الحالة
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Customer Info & Shipping (4 Cols) */}
                <div className="lg:col-span-4 space-y-4 border-l lg:border-l border-brand-gold/10 lg:pl-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-brand-emerald flex items-center gap-1.5">
                      <User className="w-4 h-4 text-brand-gold" />
                      معلومات العميل
                    </h4>
                    <div className="bg-brand-bg/30 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50">الاسم:</span>
                        <span className="font-bold text-brand-dark">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-brand-dark/50">الهاتف:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-brand-dark">{order.phone}</span>
                          <a 
                            href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 bg-green-50 text-green-600 rounded border border-green-200 hover:bg-green-100 transition"
                            title="مراسلة عبر واتساب"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-brand-emerald flex items-center gap-1.5">
                      {order.deliveryType === 'DELIVERY' ? (
                        <Truck className="w-4 h-4 text-brand-gold" />
                      ) : (
                        <MapPin className="w-4 h-4 text-brand-gold" />
                      )}
                      تفاصيل الاستلام والتوصيل
                    </h4>
                    <div className="bg-brand-bg/30 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50">نوع التوصيل:</span>
                        <span className="font-bold text-brand-dark">
                          {order.deliveryType === 'DELIVERY' ? 'توصيل للمنزل' : 'استلام من الفرع'}
                        </span>
                      </div>
                      {order.deliveryType === 'DELIVERY' ? (
                        <div className="space-y-1">
                          <span className="text-brand-dark/50 block">عنوان الشحن:</span>
                          <span className="font-bold text-brand-dark block bg-white p-2 rounded border border-brand-gold/10">
                            {order.shippingAddress || 'لم يحدد العنوان بالتفصيل'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-brand-dark/50">الفرع المحدد:</span>
                          <span className="font-bold text-brand-emerald">{order.branch?.name || 'الفرع الرئيسي'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-brand-emerald flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-gold" />
                      معلومات الدفع
                    </h4>
                    <div className="bg-brand-bg/30 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-brand-dark/50">طريقة الدفع:</span>
                        <span className="font-bold text-brand-dark">{getPaymentMethodLabel(order.paymentMethod)}</span>
                      </div>
                      
                      {order.paymentMethod === 'BANK_TRANSFER' && order.payments?.[0] && (
                        <div className="border-t border-brand-gold/10 pt-2 mt-2 space-y-2">
                          <span className="text-[10px] text-brand-dark/50 font-bold block">إيصال التحويل المرفق:</span>
                          {order.payments?.[0]?.receiptImage ? (
                            <div className="relative group rounded border border-brand-gold/20 overflow-hidden bg-brand-bg h-24 flex items-center justify-center">
                              <img 
                                src={api.imageUrl(order.payments?.[0]?.receiptImage)} 
                                alt="إيصال الدفع"
                                className="w-full h-full object-cover"
                              />
                              <button 
                                onClick={() => setSelectedReceipt(order.payments?.[0]?.receiptImage || null)}
                                className="absolute inset-0 bg-brand-dark/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1 text-brand-gold" />
                                عرض بالحجم الكامل
                              </button>
                            </div>
                          ) : (
                            <span className="text-rose-600 block text-[10px]">لم يتم إرفاق إيصال بعد!</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items & Summary (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-brand-emerald flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand-gold" />
                      المنتجات المطلوبة ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {order.items?.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-brand-bg/25 border border-brand-gold/10 p-2.5 rounded-lg flex gap-3.5 items-center hover:bg-brand-bg/40 transition"
                        >
                          <div className="w-14 h-14 rounded-md bg-brand-bg border border-brand-gold/10 overflow-hidden shrink-0">
                            {item.product?.images && item.product.images[0] ? (
                              <img 
                                src={api.imageUrl(item.product.images[0].imageUrl)}
                                alt={item.product.nameAr}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-brand-gold opacity-40" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-black text-brand-dark truncate">{item.product?.nameAr || 'منتج غير متوفر'}</h5>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-brand-dark/60 mt-1">
                              <span className="flex items-center gap-0.5">
                                <Scale className="w-2.5 h-2.5 text-brand-gold" />
                                العيار: {item.karat}
                              </span>
                              <span>الوزن: {item.weight} جم</span>
                              <span>الكمية: {item.quantity}</span>
                              <span>صياغة الجرام: {item.makingCostPerGram} د.ل</span>
                            </div>
                          </div>

                          <div className="text-left shrink-0">
                            <span className="text-xs font-black text-brand-emerald">
                              {(item.totalItemPrice).toLocaleString('ar-LY')} د.ل
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Totals */}
                  <div className="bg-brand-emerald/[0.03] border border-brand-gold/15 p-4 rounded-xl mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <span className="text-brand-dark/50 block mb-0.5">إجمالي الوزن</span>
                        <span className="font-black text-brand-dark">{order.totalWeight} جرام</span>
                      </div>
                      <div>
                        <span className="text-brand-dark/50 block mb-0.5">إجمالي الصياغة</span>
                        <span className="font-black text-brand-dark">{order.totalMakingCost.toLocaleString('ar-LY')} د.ل</span>
                      </div>
                      <div>
                        <span className="text-brand-dark/50 block mb-0.5">سعر الذهب للجرام</span>
                        <span className="font-black text-brand-gold text-[10px] block">
                          عيار 18: {order.goldPrice?.karat18} | عيار 21: {order.goldPrice?.karat21}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-brand-gold/15 pt-3 flex justify-between items-center">
                      <span className="text-xs font-black text-brand-dark">القيمة الإجمالية للطلب:</span>
                      <span className="text-lg font-black text-brand-emerald flex items-center">
                        <DollarSign className="w-5 h-5 text-brand-gold" />
                        {order.totalPrice.toLocaleString('ar-LY')} دينار ليبي
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-brand-dark/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full border border-brand-gold relative shadow-2xl">
            <div className="bg-brand-emerald text-brand-gold p-3 flex justify-between items-center">
              <h3 className="text-sm font-bold">معاينة إيصال التحويل البنكي</h3>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-white hover:text-brand-gold transition text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="p-4 bg-brand-bg flex items-center justify-center min-h-[300px] max-h-[500px]">
              <img 
                src={api.imageUrl(selectedReceipt)} 
                alt="إيصال كامل"
                className="max-w-full max-h-[400px] object-contain rounded border border-brand-gold/25"
              />
            </div>
            <div className="p-3 bg-white border-t border-brand-gold/10 flex justify-end gap-2">
              <a 
                href={api.imageUrl(selectedReceipt)} 
                target="_blank" 
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-brand-emerald text-brand-gold font-bold text-xs rounded hover:bg-brand-emerald/90 transition flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                فتح في علامة تبويب جديدة
              </a>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-3.5 py-1.5 bg-gray-200 text-brand-dark font-bold text-xs rounded hover:bg-gray-300 transition cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
