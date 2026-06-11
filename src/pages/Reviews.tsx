import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Star, Search, Package, MessageSquare, Loader2 } from 'lucide-react';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const Reviews: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadReviews = async (productId: string) => {
    setSelectedProductId(productId);
    setLoadingReviews(true);
    try {
      const data = await api.getProductReviews(productId);
      setReviews(data);
    } catch { setReviews([]); }
    setLoadingReviews(false);
  };

  const filteredProducts = products.filter(p =>
    p.nameAr?.includes(searchQuery) || p.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-brand-gold fill-brand-gold' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-emerald text-right">التقييمات والمراجعات</h1>
            <p className="text-sm text-gray-500 text-right">عرض تقييمات العملاء لكل منتج</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-brand-gold" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products list */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-brand-border p-4 max-h-[70vh] overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن منتج..."
              className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">لا توجد منتجات</p>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadReviews(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                    selectedProductId === p.id
                      ? 'bg-brand-emerald text-white shadow-md'
                      : 'bg-brand-bg hover:bg-brand-gold/10'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${selectedProductId === p.id ? 'text-white' : 'text-gray-800'}`}>
                      {p.nameAr}
                    </p>
                    <p className={`text-xs ${selectedProductId === p.id ? 'text-white/70' : 'text-gray-400'}`}>
                      عيار {p.karat} · {p.weight} جم
                    </p>
                  </div>
                  <Package className={`w-4 h-4 flex-shrink-0 ${selectedProductId === p.id ? 'text-brand-gold' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reviews panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-border p-6">
          {!selectedProductId ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 text-brand-border" />
              <p className="text-sm">اختر منتجاً لعرض تقييماته</p>
            </div>
          ) : loadingReviews ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Star className="w-12 h-12 mb-3 text-brand-border" />
              <p className="text-sm">لا توجد تقييمات لهذا المنتج بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="flex items-center justify-between bg-brand-bg rounded-xl p-4 border border-brand-border mb-4">
                <div className="text-left">
                  <span className="text-3xl font-bold text-brand-emerald">
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400 mr-1">/ 5</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{reviews.length} تقييم</p>
                  {renderStars(Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length))}
                </div>
              </div>

              {/* Review items */}
              {reviews.map((r) => (
                <div key={r.id} className="bg-brand-bg rounded-xl p-4 border border-brand-border">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('ar-LY')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 text-right">{r.userName}</p>
                        {renderStars(r.rating)}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-brand-emerald flex items-center justify-center text-brand-gold font-bold text-sm">
                        {r.userName?.charAt(0) || '؟'}
                      </div>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600 text-right leading-relaxed mt-2">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
