import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Gem, 
  Layers, 
  TrendingUp, 
  CalendarCheck2, 
  Sparkles, 
  MapPin, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Star,
  ShoppingBag
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'لوحة الإحصائيات', icon: LayoutDashboard },
    { id: 'products', name: 'إدارة المنتجات', icon: Gem },
    { id: 'categories', name: 'التصنيفات', icon: Layers },
    { id: 'orders', name: 'طلبات الشراء', icon: ShoppingBag },
    { id: 'custom-orders', name: 'الطلبات الخاصة', icon: Sparkles },
    { id: 'gold-prices', name: 'أسعار الذهب', icon: TrendingUp },
    { id: 'appointments', name: 'الحجوزات', icon: CalendarCheck2 },
    { id: 'branches', name: 'الفروع', icon: MapPin },
    { id: 'reviews', name: 'التقييمات', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-brand-emerald text-white flex flex-col justify-between border-l border-brand-gold/10 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-brand-gold/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-icon.png" 
              alt="مجوهرات حمزة" 
              className="h-10 w-10 object-contain filter drop-shadow-[0_1px_5px_rgba(198,163,74,0.4)]"
            />
            <div>
              <h2 className="text-lg font-bold text-brand-gold tracking-wide m-0">مجوهرات حمزة</h2>
              <span className="text-[10px] text-brand-bg/60">لوحة تحكم الإدارة</span>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            className="lg:hidden text-white/80 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-brand-gold text-brand-emerald shadow-lg shadow-brand-gold/10 font-bold' 
                    : 'text-brand-bg/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-emerald' : 'text-brand-gold'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-brand-gold/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center border border-brand-gold/30">
              <UserIcon className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate m-0 leading-tight">{user?.name}</p>
              <span className="text-xs text-brand-gold leading-none">
                {user?.role === 'SUPER_ADMIN' ? 'مدير عام' : 'موظف'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-950/20 hover:bg-red-900/40 text-red-200 border border-red-900/30 hover:border-red-800/40 text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-brand-gold/15 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-brand-emerald p-1 rounded hover:bg-brand-emerald/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-brand-emerald m-0">
              {menuItems.find(item => item.id === activeTab)?.name || 'الرئيسية'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick gold display */}
            <div className="bg-brand-gold/10 border border-brand-gold/20 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brand-emerald flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              <span>مجوهرات حمزة - طرابلس</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-brand-bg/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
