import React, { useEffect, useState } from 'react';
import { api, type Branch } from '../services/api';
import { MapPin, Phone, Clock, Plus, Trash2, Edit2, Check, X, Link, RefreshCw } from 'lucide-react';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating/editing
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Inputs
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getBranches();
      setBranches(data);
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل الفروع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setName('');
    setAddress('');
    setPhone('');
    setWhatsapp('');
    setWorkingHours('يومياً من 10:00 صباحاً إلى 9:00 مساءً');
    setMapUrl('');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setPhone(branch.phone);
    setWhatsapp(branch.whatsapp);
    setWorkingHours(branch.workingHours);
    setMapUrl(branch.mapUrl || '');
    setIsActive(branch.isActive);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !phone || !workingHours) {
      alert('الرجاء تعبئة كافة الحقول الأساسية للفرع');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        address,
        phone,
        whatsapp: whatsapp || phone,
        workingHours,
        mapUrl: mapUrl || undefined,
        isActive
      };

      if (editingBranch) {
        await api.updateBranch(editingBranch.id, payload);
        alert('تم تحديث بيانات الفرع بنجاح');
      } else {
        await api.createBranch(payload);
        alert('تمت إضافة الفرع الجديد بنجاح');
      }
      setIsFormOpen(false);
      await loadBranches();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ بيانات الفرع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفرع؟ قد يؤثر ذلك على الحجوزات المرتبطة به.')) {
      return;
    }

    try {
      await api.deleteBranch(id);
      alert('تم حذف الفرع بنجاح');
      await loadBranches();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الفرع');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل الفروع...</p>
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
      {/* Header with New Branch button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-gold/15 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-brand-emerald m-0">إدارة فروع مجوهرات حمزة</h3>
          <p className="text-xs text-brand-dark/50">إضافة وتعديل بيانات معارض طرابلس المعروضة للعملاء.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold hover:text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع جديد</span>
        </button>
      </div>

      {/* Form Overlay Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-brand-gold/20 shadow-xl overflow-hidden animate-scale-in">
            <div className="bg-brand-emerald p-4 text-white flex justify-between items-center border-b border-brand-gold/10">
              <h4 className="font-bold text-brand-gold m-0">
                {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
              </h4>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark/70">اسم الفرع المعرض *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: فرع طرابلس - زاوية الدهماني"
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark/70">العنوان بالتفصيل *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="طرابلس، شارع..."
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark/70">رقم الهاتف *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 091-XXXXXXX"
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-dark/70">رقم الواتساب</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="مثال: 21891XXXXXXX"
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark/70">أوقات العمل اليومية *</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="يومياً من 10:00 صباحاً إلى 9:00 مساءً"
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-brand-dark/70">رابط موقع الخريطة (Google Maps URL)</label>
                  <input
                    type="url"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-emerald focus:ring-brand-gold"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-brand-dark/70 cursor-pointer">الفرع نشط ويستقبل حجوزات</label>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-brand-gold/10 pt-4 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold hover:text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ الفرع</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-brand-dark/75 font-bold text-xs rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branches Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between ${
              branch.isActive ? 'border-brand-gold/15' : 'border-gray-200 bg-gray-50/50 opacity-70'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-base font-black text-brand-emerald flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-brand-gold" />
                  {branch.name}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  branch.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {branch.isActive ? 'نشط' : 'مغلق مؤقتاً'}
                </span>
              </div>

              <p className="text-xs text-brand-dark/75 font-medium mt-3 bg-brand-bg/40 p-2.5 rounded border border-brand-gold/5 leading-relaxed">
                {branch.address}
              </p>

              <div className="space-y-2.5 mt-4 text-xs">
                <div className="flex items-center gap-2 text-brand-dark/70">
                  <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>{branch.workingHours}</span>
                </div>
                <div className="flex items-center gap-2 text-brand-dark/70">
                  <Phone className="w-4 h-4 text-brand-gold shrink-0" />
                  <span className="font-mono font-bold" dir="ltr">{branch.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-brand-gold/10 pt-4 mt-4">
              <button
                onClick={() => handleOpenEdit(branch)}
                className="flex-1 py-1.5 bg-brand-bg hover:bg-brand-gold/10 text-brand-emerald border border-brand-gold/25 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>

              {branch.mapUrl && (
                <a
                  href={branch.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-brand-gold/15 text-brand-emerald hover:bg-brand-gold/25 border border-brand-gold/20 font-bold text-xs rounded-lg transition flex items-center justify-center cursor-pointer"
                  title="موقع الخريطة"
                >
                  <Link className="w-3.5 h-3.5 text-brand-gold" />
                </a>
              )}

              <button
                onClick={() => handleDelete(branch.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-lg transition flex items-center justify-center cursor-pointer"
                title="حذف الفرع"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white border border-brand-gold/15 rounded-xl">
            <MapPin className="w-12 h-12 text-brand-gold mx-auto mb-3" />
            <p className="text-brand-dark/50 text-sm">لا توجد فروع مسجلة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Branches;
