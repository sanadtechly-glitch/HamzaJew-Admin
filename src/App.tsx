import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import GoldPrices from './pages/GoldPrices';
import Appointments from './pages/Appointments';
import CustomOrders from './pages/CustomOrders';
import Branches from './pages/Branches';
import Reviews from './pages/Reviews';

const AdminAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-brand-emerald text-white"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #004d37 0%, #002218 100%)'
        }}
      >
        <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-brand-gold">مجوهرات حمزة</h2>
        <p className="text-sm text-brand-bg/60 mt-1">جاري التحقق من الهوية والاتصال بالخادم...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Router matching corresponding tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'orders':
        return <Orders />;
      case 'gold-prices':
        return <GoldPrices />;
      case 'appointments':
        return <Appointments />;
      case 'custom-orders':
        return <CustomOrders />;
      case 'branches':
        return <Branches />;
      case 'reviews':
        return <Reviews />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminAppContent />
    </AuthProvider>
  );
};

export default App;
