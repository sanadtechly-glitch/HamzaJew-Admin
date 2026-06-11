import React, { useEffect, useState } from 'react';
import { api, type CustomOrder } from '../services/api';
import { Sparkles, Phone, User, AlertCircle, Search, MessageSquare, Image, DollarSign } from 'lucide-react';

const CustomOrders: React.FC = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filtering
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit action
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCustomOrders();
      // Sort: NEW first, then UNDER_REVIEW, then by creation date descending
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'NEW' && b.status !== 'NEW') return -1;
        if (a.status !== 'NEW' && b.status === 'NEW') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sorted);
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل طلبات التصميم الخاصة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      await api.updateCustomOrderStatus(id, newStatus, adminNotes);
      alert('تم تحديث حالة طلب التفصيل بنجاح');
      setEditingId(null);
      setAdminNotes('');
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة طلب التفصيل');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      order.itemType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل طلبات التفصيل الخاصة...</p>
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
      {/* Search and Filters Header */}
      <div className="bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-brand-dark/40" />
          <input
            type="text"
            placeholder="البحث باسم العميل، الهاتف، نوع القطعة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm bg-brand-bg/50 border border-brand-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto shrink-0 py-1 justify-end">
          {['ALL', 'NEW', 'UNDER_REVIEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black transition shrink-0 cursor-pointer ${
                statusFilter === st 
                  ? 'bg-brand-emerald text-brand-gold shadow' 
                  : 'bg-brand-bg hover:bg-brand-gold/10 text-brand-dark/70 border border-brand-gold/10'
              }`}
            >
              {st === 'ALL' && 'الكل'}
              {st === 'NEW' && 'جديد'}
              {st === 'UNDER_REVIEW' && 'قيد المراجعة'}
              {st === 'CONTACTED' && 'تم التواصل'}
              {st === 'COMPLETED' && 'مكتمل'}
              {st === 'CANCELLED' && 'ملغي'}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <div 
            key={order.id} 
            className="bg-white rounded-xl border border-brand-gold/15 p-5 md:p-6 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row gap-6"
          >
            {/* Design image upload indicator */}
            <div className="w-full lg:w-48 h-48 rounded-xl bg-brand-bg border border-brand-gold/15 flex items-center justify-center shrink-0 overflow-hidden relative">
              {order.imageUrl ? (
                <img 
                  src={api.imageUrl(order.imageUrl)} 
                  alt={order.itemType}
                  className="w-full h-full object-cover transition hover:scale-105 duration-200"
                />
              ) : (
                <div className="text-center p-4">
                  <Image className="w-8 h-8 text-brand-gold mx-auto mb-2 opacity-50" />
                  <span className="text-[10px] text-brand-dark/40 block">لم يرفق العميل صورة توضيحية</span>
                </div>
              )}
            </div>

            {/* Information Body */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      order.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'UNDER_REVIEW' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'CONTACTED' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'NEW' ? 'طلب تفصيل جديد' :
                       order.status === 'UNDER_REVIEW' ? 'قيد المراجعة الفنية' :
                       order.status === 'CONTACTED' ? 'تم التواصل مع العميل' :
                       order.status === 'COMPLETED' ? 'تم التسليم والبيع' : 'طلب ملغي'}
                    </span>
                    <span className="text-xs font-bold text-brand-gold">
                      قطعة تفصيل: {order.itemType}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-brand-emerald mt-2 mb-1 flex items-center gap-1.5">
                    <User className="w-5 h-5 text-brand-gold" />
                    {order.customerName}
                  </h4>
                </div>

                <div className="sm:text-right text-xs">
                  <span className="text-[10px] text-brand-dark/45 block">تاريخ الطلب</span>
                  <span className="font-semibold text-brand-dark/70">{new Date(order.createdAt).toLocaleString('ar-LY')}</span>
                </div>
              </div>

              {/* Description & specifications */}
              <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-gold/10 space-y-3 text-xs md:text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] text-brand-dark/50 font-bold block">مواصفات القطعة المطلوبة</span>
                  <p className="text-brand-dark leading-relaxed m-0 font-medium">
                    {order.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-brand-gold/10 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-brand-dark/50 block">الميزانية المرصودة</span>
                    <span className="font-black text-brand-emerald flex items-center gap-0.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-brand-gold" />
                      {order.budget ? `${order.budget} د.ل` : 'غير محددة'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-brand-dark/50 block">الفرع المفضل للاستلام</span>
                    <span className="font-bold text-brand-dark text-xs">{order.branch?.name || 'فرع طرابلس'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-brand-gold/10 pt-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-gold" />
                  <span className="text-brand-dark/80 font-mono font-bold" dir="ltr">{order.phone}</span>
                  <a 
                    href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded border border-green-200 hover:bg-green-100 transition mr-2"
                  >
                    واتساب العميل للاتفاق
                  </a>
                </div>
              </div>

              {order.adminNotes && (
                <div className="bg-brand-gold/5 border border-brand-gold/15 p-3 rounded-lg flex gap-2.5 items-start text-xs">
                  <MessageSquare className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-brand-gold font-bold block mb-0.5">سجل ملاحظات مراجعة الإدارة والاتفاق</span>
                    <p className="text-brand-dark/80 m-0 leading-relaxed">{order.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Status Update Form */}
              {editingId === order.id ? (
                <div className="space-y-3 pt-3 border-t border-brand-gold/10">
                  <textarea
                    placeholder="اكتب تفاصيل الاتفاق أو الملاحظات هنا..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full p-2.5 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'UNDER_REVIEW')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      مراجعة فنية
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CONTACTED')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      تم التواصل
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      اكتمال وتسليم
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      disabled={updating}
                      className="px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      إلغاء الطلب
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setAdminNotes(''); }}
                      className="px-3 py-1.5 bg-gray-150 text-brand-dark/70 font-bold text-xs rounded-lg cursor-pointer hover:bg-gray-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setEditingId(order.id);
                      setAdminNotes(order.adminNotes || '');
                    }}
                    className="w-full py-2 bg-brand-bg hover:bg-brand-gold/10 text-brand-emerald font-bold text-xs border border-brand-gold/25 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-brand-gold" />
                    <span>تعديل حالة طلب التفصيل وكتابة الملاحظات والاتفاق</span>
                  </button>
                )
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white border border-brand-gold/15 rounded-xl">
            <Sparkles className="w-12 h-12 text-brand-gold mx-auto mb-3" />
            <p className="text-brand-dark/50 text-sm">لا توجد طلبات تصاميم خاصة تطابق الفلاتر المحددة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrders;
