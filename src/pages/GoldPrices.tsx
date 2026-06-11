import React, { useEffect, useState } from 'react';
import { api, type GoldPrice } from '../services/api';
import { TrendingUp, RefreshCw, Calendar, User, Info } from 'lucide-react';

const GoldPrices: React.FC = () => {
  const [history, setHistory] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [karat18, setKarat18] = useState<string>('');
  const [karat21, setKarat21] = useState<string>('');
  const [karat24, setKarat24] = useState<string>('');

  const loadGoldPrices = async () => {
    try {
      setLoading(true);
      const [current, hist] = await Promise.all([
        api.getGoldPrice().catch(() => null),
        api.getGoldPriceHistory().catch(() => [])
      ]);
      
      setHistory(hist);
      
      if (current) {
        setKarat18(current.karat18.toString());
        setKarat21(current.karat21.toString());
        setKarat24(current.karat24.toString());
      }
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل بيانات أسعار الذهب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoldPrices();
  }, []);

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    const k18 = parseFloat(karat18);
    const k21 = parseFloat(karat21);
    const k24 = parseFloat(karat24);

    if (isNaN(k18) || isNaN(k21) || isNaN(k24) || k18 <= 0 || k21 <= 0 || k24 <= 0) {
      alert('الرجاء إدخال أسعار صحيحة للذهب لجميع العيارات');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateGoldPrice(k18, k21, k24);
      alert('تم تحديث أسعار الذهب اليومية بنجاح!');
      await loadGoldPrices();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تعديل أسعار الذهب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل أسعار وسجلات الذهب اليومية...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center text-sm font-semibold">
          {error}
        </div>
      )}
      {/* Live Gold Price update panel */}
      <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-gold" />
          <h3 className="text-lg font-bold text-brand-emerald m-0">تحديث أسعار الذهب اليومية</h3>
        </div>
        <p className="text-xs text-brand-dark/50 mb-5">
          تعديل هذه القيم سيقوم تلقائياً بتحديث الحسابات والأسعار المعروضة لجميع قطع الذهب في التطبيق والموقع بناءً على أوزانها وعياراتها.
        </p>

        <form onSubmit={handleUpdatePrices} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">سعر جرام الذهب عيار 24 (د.ل) *</label>
            <input
              type="number"
              step="0.01"
              value={karat24}
              onChange={(e) => setKarat24(e.target.value)}
              placeholder="مثال: 395"
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">سعر جرام الذهب عيار 21 (د.ل) *</label>
            <input
              type="number"
              step="0.01"
              value={karat21}
              onChange={(e) => setKarat21(e.target.value)}
              placeholder="مثال: 345"
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">سعر جرام الذهب عيار 18 (د.ل) *</label>
            <input
              type="number"
              step="0.01"
              value={karat18}
              onChange={(e) => setKarat18(e.target.value)}
              placeholder="مثال: 295"
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              required
            />
          </div>

          <div className="bg-brand-bg/60 p-3 rounded-lg border border-brand-gold/15 flex gap-2.5 items-start text-xs text-brand-dark/70">
            <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <span>يتم تقييم أسعار الذهب بالدينار الليبي (د.ل). القيمة الافتراضية تعبر عن سعر جرام الذهب الصافي بدون تكلفة المصنعية للقطع.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold hover:text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ والتعميم...</span>
              </>
            ) : (
              <span>تعميم الأسعار الجديدة</span>
            )}
          </button>
        </form>
      </div>

      {/* History Audit Log */}
      <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-brand-emerald m-0">سجل التغييرات والتدقيق الأسعار</h3>
        <p className="text-xs text-brand-dark/50">تتبع سجل تحديثات أسعار الذهب المنفذة من قبل مدراء النظام.</p>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {history.map((log) => (
            <div 
              key={log.id} 
              className="p-4 bg-brand-bg/30 border border-brand-gold/10 rounded-xl space-y-3 hover:border-brand-gold/30 transition duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-brand-dark/50 gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-gold" />
                  <span className="font-bold text-brand-emerald">{log.admin?.name || 'مدير النظام'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span>{new Date(log.createdAt).toLocaleString('ar-LY')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border border-brand-gold/10 p-2.5 rounded-lg">
                  <span className="text-[10px] text-brand-dark/50 font-bold block">عيار 24</span>
                  <span className="text-sm font-black text-brand-emerald font-mono mt-0.5 block">{log.karat24} د.ل</span>
                </div>
                <div className="bg-white border border-brand-gold/10 p-2.5 rounded-lg">
                  <span className="text-[10px] text-brand-dark/50 font-bold block">عيار 21</span>
                  <span className="text-sm font-black text-brand-emerald font-mono mt-0.5 block">{log.karat21} د.ل</span>
                </div>
                <div className="bg-white border border-brand-gold/10 p-2.5 rounded-lg">
                  <span className="text-[10px] text-brand-dark/50 font-bold block">عيار 18</span>
                  <span className="text-sm font-black text-brand-emerald font-mono mt-0.5 block">{log.karat18} د.ل</span>
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-12 border border-dashed border-brand-gold/20 rounded-xl bg-brand-bg/20">
              <p className="text-brand-dark/40 text-sm">لا توجد عمليات تحديث مسجلة سابقاً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldPrices;
