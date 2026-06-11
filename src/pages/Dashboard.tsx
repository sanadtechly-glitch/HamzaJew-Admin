import React, { useEffect, useState } from 'react';
import { api, type DashboardStats, type GoldPrice } from '../services/api';
import { 
  Gem, 
  Layers, 
  CalendarCheck2, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, currentGold] = await Promise.all([
          api.getDashboardStats(),
          api.getGoldPrice()
        ]);
        setStats(statsData);
        setGoldPrice(currentGold);
      } catch (err: any) {
        console.error(err);
        setError('فشل تحميل بيانات لوحة الإحصائيات');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل الإحصائيات والبيانات...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center">
        <p className="font-bold">{error || 'حدث خطأ غير متوقع'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-emerald text-white font-medium rounded-lg hover:bg-brand-emerald/90 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'إجمالي المنتجات',
      value: stats.counts.products,
      desc: 'منتج في الكتالوج النشط',
      icon: Gem,
      color: 'bg-emerald-50 text-brand-emerald border-emerald-100',
      action: 'products'
    },
    {
      title: 'أقسام التصنيفات',
      value: stats.counts.categories,
      desc: 'فئات مجوهرات معروضة',
      icon: Layers,
      color: 'bg-amber-55 text-amber-800 border-amber-100',
      action: 'categories'
    },
    {
      title: 'الحجوزات النشطة',
      value: stats.counts.appointments,
      desc: 'طلب موعد فروع طرابلس',
      icon: CalendarCheck2,
      color: 'bg-blue-50 text-blue-800 border-blue-100',
      action: 'appointments'
    },
    {
      title: 'طلبات التفصيل الخاصة',
      value: stats.counts.customOrders,
      desc: 'طلب تصميم خاص للعملاء',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-800 border-purple-100',
      action: 'custom-orders'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with live gold ticker status */}
      <div className="bg-brand-emerald text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-brand-gold/20">
        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-gold/10 rounded-br-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-gold mb-2">أهلاً بك في نظام إدارة مجوهرات حمزة</h2>
            <p className="text-brand-bg/80 text-sm max-w-xl">
              يمكنك هنا تتبع الأسعار اليومية للذهب، مراجعة حجوزات العملاء في فروع طرابلس، وتلقي ومعالجة طلبات التفصيل للقطع والمجوهرات الفاخرة.
            </p>
          </div>

          {/* Quick gold display */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4 shrink-0">
            <div className="p-2 bg-brand-gold/25 rounded-lg border border-brand-gold/20">
              <TrendingUp className="w-6 h-6 text-brand-gold" />
            </div>
            <div>
              <span className="text-xs text-brand-bg/70 block">سعر الذهب اليوم (عيار 21)</span>
              <p className="text-lg font-black text-brand-gold m-0">
                {goldPrice ? `${goldPrice.karat21} د.ل` : 'لم يتم الضبط'}
              </p>
              <span className="text-[10px] text-brand-bg/60">لكل جرام مصنّع</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx}
              onClick={() => onNavigate(kpi.action)}
              className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-brand-dark/50 block">{kpi.title}</span>
                  <span className="text-3xl font-black text-brand-dark mt-2 block">{kpi.value}</span>
                </div>
                <div className={`p-3 rounded-lg border ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-brand-gold/10 flex items-center justify-between text-xs text-brand-emerald font-bold">
                <span>{kpi.desc}</span>
                <ChevronLeft className="w-4 h-4 text-brand-gold" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section & Gold Prices Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom designs budget trend */}
        <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-emerald m-0">ميزانيات طلبات التصاميم الخاصة</h3>
              <p className="text-xs text-brand-dark/60">تحليل تراكمي للميزانيات المقدرة لطلبات العملاء شهرياً (بالدينار الليبي)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats.monthlyCustomOrders && stats.monthlyCustomOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.monthlyCustomOrders}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A34A" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C6A34A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                  <XAxis dataKey="month" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      direction: 'rtl', 
                      textAlign: 'right',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #C6A34A',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value} د.ل`, 'إجمالي الميزانيات']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#C6A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-brand-gold/20 rounded-xl bg-brand-bg/20">
                <p className="text-brand-dark/40 text-sm">لا توجد بيانات كافية لعرض الرسم البياني حالياً</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Gold Rates Details */}
        <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-emerald m-0">أسعار الذهب الرسمية اليوم</h3>
            </div>
            <p className="text-xs text-brand-dark/50 mb-6">الأسعار المستخدمة في حاسبة سعر القطع داخل تطبيق وموقع العملاء.</p>

            <div className="space-y-4">
              {[
                { karat: '24', key: 'karat24', label: 'عيار 24' },
                { karat: '21', key: 'karat21', label: 'عيار 21' },
                { karat: '18', key: 'karat18', label: 'عيار 18' }
              ].map((item, index) => {
                const priceVal = goldPrice ? (goldPrice as any)[item.key] : 0;
                return (
                  <div key={index} className="flex justify-between items-center p-3 bg-brand-bg/50 border border-brand-gold/10 rounded-xl">
                    <span className="font-bold text-brand-emerald">{item.label}</span>
                    <span className="text-base font-black text-brand-dark">
                      {priceVal ? `${priceVal} د.ل` : 'غير محدد'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('gold-prices')}
            className="w-full mt-6 py-2.5 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold hover:text-white font-bold text-sm rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>تحديث أسعار الصرف والذهب</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of lists: Recent Appointments & Recent Custom Designs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-gold" />
              <h3 className="text-base font-bold text-brand-emerald m-0">آخر طلبات الحجوزات</h3>
            </div>
            <button 
              onClick={() => onNavigate('appointments')}
              className="text-xs text-brand-gold font-bold hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {stats.latestAppointments && stats.latestAppointments.length > 0 ? (
              stats.latestAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className="p-3 bg-brand-bg/30 border border-brand-gold/10 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-brand-dark text-sm m-0 mb-1">{app.customerName}</p>
                    <span className="text-brand-dark/50">{app.branch?.name} - {app.date} {app.time}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    app.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status === 'NEW' ? 'جديد' :
                     app.status === 'CONFIRMED' ? 'مؤكد' :
                     app.status === 'COMPLETED' ? 'مكتمل' : 'ملغي'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-brand-dark/40 text-xs">لا توجد حجوزات واردة حالياً</div>
            )}
          </div>
        </div>

        {/* Recent Custom Designs */}
        <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <h3 className="text-base font-bold text-brand-emerald m-0">آخر طلبات التصاميم الخاصة</h3>
            </div>
            <button 
              onClick={() => onNavigate('custom-orders')}
              className="text-xs text-brand-gold font-bold hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {stats.latestCustomOrders && stats.latestCustomOrders.length > 0 ? (
              stats.latestCustomOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="p-3 bg-brand-bg/30 border border-brand-gold/10 rounded-xl flex items-center justify-between text-xs animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    {order.imageUrl && (
                      <img 
                        src={api.imageUrl(order.imageUrl)} 
                        alt={order.itemType}
                        className="w-10 h-10 object-cover rounded-lg border border-brand-gold/25"
                      />
                    )}
                    <div>
                      <p className="font-bold text-brand-dark text-sm m-0 mb-1">{order.customerName}</p>
                      <span className="text-brand-dark/50">نوع القطعة: {order.itemType} {order.budget ? `- ميزانية: ${order.budget} د.ل` : ''}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    order.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                    order.status === 'UNDER_REVIEW' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'CONTACTED' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'NEW' ? 'جديد' :
                     order.status === 'UNDER_REVIEW' ? 'قيد المراجعة' :
                     order.status === 'CONTACTED' ? 'تم التواصل' :
                     order.status === 'COMPLETED' ? 'مكتمل' : 'ملغي'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-brand-dark/40 text-xs">لا توجد طلبات تفصيل خاصة واردة حالياً</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
