import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Phone, AlertCircle, Loader } from 'lucide-react';

const Login: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!phone.trim() || !password.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      await login(phone.trim(), password);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-brand-emerald relative overflow-hidden px-4"
      style={{
        backgroundImage: 'radial-gradient(circle at center, #004d37 0%, #002218 100%)'
      }}
    >
      {/* Decorative luxury abstract circles */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full border border-brand-gold/10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-120 h-120 rounded-full border border-brand-gold/5 pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-2xl shadow-2xl border border-brand-gold/20 overflow-hidden z-10 p-8 flex flex-col items-center">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo-icon.png" 
            alt="مجوهرات حمزة" 
            className="h-24 object-contain mb-4 filter drop-shadow-[0_2px_10px_rgba(198,163,74,0.3)]"
            onError={(e) => {
              // Fallback text if logo fails to render
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-extrabold text-brand-gold tracking-wide m-0 text-center">
            مجوهرات حمزة
          </h1>
          <p className="text-brand-bg/70 text-sm mt-1">لوحة تحكم الإدارة والموظفين</p>
        </div>

        {/* Error Notifications */}
        {(error || formError) && (
          <div className="w-full mb-6 bg-red-950/40 border border-red-500/30 text-red-200 rounded-lg p-3 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-2">
            <label className="text-brand-bg/90 text-sm font-medium block">رقم الهاتف</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-brand-gold/60" />
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="block w-full pr-10 pl-3 py-2.5 bg-black/20 border border-brand-gold/20 rounded-xl text-white placeholder-brand-bg/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent transition text-left direction-ltr"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-brand-bg/90 text-sm font-medium block">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-brand-gold/60" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pr-10 pl-3 py-2.5 bg-black/20 border border-brand-gold/20 rounded-xl text-white placeholder-brand-bg/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent transition text-left direction-ltr"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-gradient-to-r from-brand-gold to-[#e5c168] hover:from-[#d4af4a] hover:to-brand-gold text-brand-emerald font-bold rounded-xl shadow-lg hover:shadow-brand-gold/20 transform active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-brand-bg/40 border-t border-brand-gold/10 w-full pt-4">
          جميع الحقوق محفوظة © مجوهرات حمزة 2026
        </div>
      </div>
    </div>
  );
};

export default Login;
