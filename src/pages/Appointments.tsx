import React, { useEffect, useState } from 'react';
import { api, type Appointment } from '../services/api';
import { Calendar, Phone, User, CheckCircle, XCircle, AlertCircle, Search, MessageSquare } from 'lucide-react';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering and Searching
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Status Change Dialog or inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAppointments();
      // Sort: NEW first, then CONFIRMED, then by date descending
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'NEW' && b.status !== 'NEW') return -1;
        if (a.status !== 'NEW' && b.status === 'NEW') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setAppointments(sorted);
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل حجوزات المواعيد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      await api.updateAppointmentStatus(id, newStatus, adminNotes);
      alert('تم تحديث حالة الحجز بنجاح');
      setEditingId(null);
      setAdminNotes('');
      await loadAppointments();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الحجز');
    } finally {
      setUpdating(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.customerName.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search);
    
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل الحجوزات...</p>
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
            placeholder="البحث باسم العميل أو رقم الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm bg-brand-bg/50 border border-brand-gold/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          {['ALL', 'NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === st 
                  ? 'bg-brand-emerald text-brand-gold shadow' 
                  : 'bg-brand-bg hover:bg-brand-gold/10 text-brand-dark/70 border border-brand-gold/10'
              }`}
            >
              {st === 'ALL' && 'الكل'}
              {st === 'NEW' && 'جديد'}
              {st === 'CONFIRMED' && 'مؤكد'}
              {st === 'COMPLETED' && 'مكتمل'}
              {st === 'CANCELLED' && 'ملغي'}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAppointments.map((app) => (
          <div 
            key={app.id} 
            className="bg-white rounded-xl border border-brand-gold/15 p-5 shadow-sm space-y-4 hover:shadow-md transition"
          >
            {/* Appointment Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  app.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                  app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {app.status === 'NEW' ? 'حجز جديد' :
                   app.status === 'CONFIRMED' ? 'موعد مؤكد' :
                   app.status === 'COMPLETED' ? 'تمت الزيارة' : 'حجز ملغي'}
                </span>
                <h4 className="text-base font-black text-brand-emerald mt-2 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-gold" />
                  {app.customerName}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-brand-dark/45 block">تاريخ التقديم</span>
                <span className="text-[10px] text-brand-dark/60 font-semibold">{new Date(app.createdAt).toLocaleDateString('ar-LY')}</span>
              </div>
            </div>

            {/* Visit Details */}
            <div className="grid grid-cols-2 gap-3 bg-brand-bg/40 p-3 rounded-lg border border-brand-gold/10 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-brand-dark/50 block">الفرع المطلوب</span>
                <span className="font-bold text-brand-emerald">{app.branch?.name || 'فرع طرابلس'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-brand-dark/50 block">الموعد المحدد</span>
                <span className="font-bold text-brand-dark flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  {app.date} في {app.time}
                </span>
              </div>
              <div className="col-span-2 space-y-1 border-t border-brand-gold/10 pt-2 mt-1">
                <span className="text-[10px] text-brand-dark/50 block">سبب الزيارة الحجز</span>
                <span className="text-brand-dark font-medium">{app.reason}</span>
              </div>
              {app.notes && (
                <div className="col-span-2 space-y-1 border-t border-brand-gold/10 pt-2 mt-1">
                  <span className="text-[10px] text-brand-dark/50 block">ملاحظات العميل</span>
                  <span className="text-brand-dark/80 italic">"{app.notes}"</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-4 h-4 text-brand-gold" />
                <span className="text-brand-dark/80 font-mono font-bold" dir="ltr">{app.phone}</span>
                <a 
                  href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-200 hover:bg-green-100 transition mr-auto"
                >
                  واتساب للعميل
                </a>
              </div>

              {app.adminNotes && (
                <div className="bg-brand-gold/5 border border-brand-gold/15 p-2.5 rounded-lg flex gap-2 items-start text-xs">
                  <MessageSquare className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-brand-gold font-bold block mb-0.5">ملاحظات الإدارة</span>
                    <p className="text-brand-dark/80 m-0">{app.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {editingId === app.id ? (
              <div className="space-y-3 pt-3 border-t border-brand-gold/10">
                <textarea
                  placeholder="أدخل ملاحظات حول الحجز (مثال: تم الاتصال لتغيير الموعد...)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                    disabled={updating}
                    className="px-3 py-1.5 bg-brand-emerald text-brand-gold hover:text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>تأكيد الموعد</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                    disabled={updating}
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>اكتملت الزيارة</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                    disabled={updating}
                    className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>إلغاء الحجز</span>
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setAdminNotes(''); }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-dark/70 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              app.status !== 'COMPLETED' && app.status !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    setEditingId(app.id);
                    setAdminNotes(app.adminNotes || '');
                  }}
                  className="w-full py-2 bg-brand-bg hover:bg-brand-gold/10 text-brand-emerald font-bold text-xs border border-brand-gold/25 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-brand-gold" />
                  <span>تعديل حالة الموعد أو إضافة ملاحظة</span>
                </button>
              )
            )}
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="md:col-span-2 text-center py-20 bg-white border border-brand-gold/15 rounded-xl">
            <Calendar className="w-12 h-12 text-brand-gold mx-auto mb-3" />
            <p className="text-brand-dark/50 text-sm">لا توجد مواعيد حجوزات تطابق الفلاتر المحددة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
