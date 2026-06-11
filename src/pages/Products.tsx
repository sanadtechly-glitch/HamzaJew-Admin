import React, { useEffect, useState } from 'react';
import { api, type Product, type Category, type GoldPrice } from '../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  X, 
  ImageIcon, 
  UploadCloud,
  Calculator
} from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKarat, setSelectedKarat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Form states
  const [categoryId, setCategoryId] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [karat, setKarat] = useState<number>(21);
  const [weight, setWeight] = useState<number>(0);
  const [makingCost, setMakingCost] = useState<number>(0);
  const [stoneType, setStoneType] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'AVAILABLE' | 'OUT_OF_STOCK' | 'BY_ORDER'>('AVAILABLE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isOffer, setIsOffer] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Image Upload states for modal
  const [tempImageFiles, setTempImageFiles] = useState<FileList | null>(null);
  const [productImages, setProductImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, cData, gData] = await Promise.all([
        api.getProducts({ 
          categoryId: selectedCategory || undefined, 
          karat: selectedKarat ? parseInt(selectedKarat) : undefined,
          search: searchQuery || undefined
        }),
        api.getCategories(),
        api.getGoldPrice().catch(() => null)
      ]);
      setProducts(pData);
      setCategories(cData);
      setGoldPrice(gData);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل بيانات المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedKarat, searchQuery]);

  // Handle live calculation
  const getGoldPriceForKarat = (k: number) => {
    if (!goldPrice) return 0;
    if (k === 18) return goldPrice.karat18;
    if (k === 24) return goldPrice.karat24;
    return goldPrice.karat21; // Default to 21
  };

  const calculatedPrice = (weight * getGoldPriceForKarat(karat)) + (weight * makingCost);

  const openCreateModal = () => {
    setModalMode('create');
    setActiveProductId(null);
    setCategoryId(categories[0]?.id || '');
    setNameAr('');
    setNameEn('');
    setDescriptionAr('');
    setDescriptionEn('');
    setKarat(21);
    setWeight(0);
    setMakingCost(0);
    setStoneType('');
    setAvailabilityStatus('AVAILABLE');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsNewArrival(true);
    setIsOffer(false);
    setIsActive(true);
    setProductImages([]);
    setTempImageFiles(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setActiveProductId(product.id);
    setCategoryId(product.categoryId);
    setNameAr(product.nameAr);
    setNameEn(product.nameEn);
    setDescriptionAr(product.descriptionAr);
    setDescriptionEn(product.descriptionEn);
    setKarat(product.karat);
    setWeight(product.weight);
    setMakingCost(product.makingCost);
    setStoneType(product.stoneType || '');
    setAvailabilityStatus(product.availabilityStatus);
    setIsFeatured(product.isFeatured);
    setIsBestSeller(product.isBestSeller);
    setIsNewArrival(product.isNewArrival);
    setIsOffer(product.isOffer);
    setIsActive(product.isActive);
    setProductImages(product.images || []);
    setTempImageFiles(null);
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !nameAr.trim() || !nameEn.trim()) {
      alert('يرجى ملء الحقول الإلزامية');
      return;
    }

    const payload = {
      categoryId,
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      karat,
      weight,
      makingCost,
      stoneType: stoneType.trim() || undefined,
      availabilityStatus,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isOffer,
      isActive,
      estimatedPrice: calculatedPrice
    };

    try {
      let savedProduct: Product;
      if (modalMode === 'create') {
        savedProduct = await api.createProduct(payload);
        // If images selected, upload them
        if (tempImageFiles && tempImageFiles.length > 0) {
          const formData = new FormData();
          for (let i = 0; i < tempImageFiles.length; i++) {
            formData.append('images', tempImageFiles[i]);
          }
          await api.uploadProductImages(savedProduct.id, formData);
        }
      } else {
        if (!activeProductId) return;
        savedProduct = await api.updateProduct(activeProductId, payload);
        // Upload images if any are selected during edit
        if (tempImageFiles && tempImageFiles.length > 0) {
          setUploadingImages(true);
          const formData = new FormData();
          for (let i = 0; i < tempImageFiles.length; i++) {
            formData.append('images', tempImageFiles[i]);
          }
          await api.uploadProductImages(activeProductId, formData);
          setUploadingImages(false);
        }
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف المنتج');
    }
  };

  const handleUploadMoreImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProductId) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const newImages = await api.uploadProductImages(activeProductId, formData);
      setProductImages(newImages);
    } catch (err: any) {
      alert(err.message || 'فشل تحميل الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('هل تريد حذف هذه الصورة؟')) return;
    try {
      await api.deleteProductImage(imageId);
      setProductImages(productImages.filter(img => img.id !== imageId));
    } catch (err: any) {
      alert(err.message || 'فشل حذف الصورة');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل المنتجات...</p>
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
      {/* Search and Filter Panel */}
      <div className="bg-white rounded-xl p-5 border border-brand-gold/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-dark/40" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم القطعة..."
              className="w-full pr-9 pl-3 py-2 bg-brand-bg/40 border border-brand-gold/15 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-brand-dark/40" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-brand-bg/40 border border-brand-gold/15 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer appearance-none"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
              ))}
            </select>
          </div>

          {/* Karat filter */}
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-brand-dark/40" />
            </span>
            <select
              value={selectedKarat}
              onChange={(e) => setSelectedKarat(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-brand-bg/40 border border-brand-gold/15 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer appearance-none"
            >
              <option value="">جميع العيارات</option>
              <option value="18">عيار 18</option>
              <option value="21">عيار 21</option>
              <option value="24">عيار 24</option>
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          onClick={openCreateModal}
          className="py-2 px-5 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold hover:text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قطعة مجوهرات</span>
        </button>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-brand-gold/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-brand-dark">
            <thead className="text-xs font-black uppercase bg-brand-bg/60 text-brand-emerald border-b border-brand-gold/10">
              <tr>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">العيار</th>
                <th className="px-6 py-4">الوزن (جرام)</th>
                <th className="px-6 py-4">المصنعية / جرام</th>
                <th className="px-6 py-4">السعر التقديري اليوم</th>
                <th className="px-6 py-4">حالة التوفر</th>
                <th className="px-6 py-4">شارات العرض</th>
                <th className="px-6 py-4 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-brand-bg/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.images && p.images.length > 0 ? (
                        <img 
                          src={api.imageUrl(p.images[0].imageUrl)} 
                          alt={p.nameAr} 
                          className="w-12 h-12 object-cover rounded-lg border border-brand-gold/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-bg/60 border border-dashed border-brand-gold/20 flex items-center justify-center text-brand-gold/40">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-brand-dark m-0">{p.nameAr}</p>
                        <span className="text-[10px] text-brand-dark/40 font-semibold">{p.nameEn}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-brand-dark/80">
                    {p.category?.nameAr}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-emerald">
                    عيار {p.karat}
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {p.weight} ج
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {p.makingCost} د.ل
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-brand-emerald">
                    {p.estimatedPrice.toFixed(2)} د.ل
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      p.availabilityStatus === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {p.availabilityStatus === 'AVAILABLE' ? 'متوفر' :
                       p.availabilityStatus === 'OUT_OF_STOCK' ? 'نفذت الكمية' : 'تحت الطلب'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                      {p.isFeatured && <span className="bg-amber-15 px-2 py-0.5 rounded text-[8px] font-bold text-amber-800 border border-amber-200">مميز</span>}
                      {p.isBestSeller && <span className="bg-rose-50 px-2 py-0.5 rounded text-[8px] font-bold text-rose-800 border border-rose-200">الأكثر مبيعاً</span>}
                      {p.isNewArrival && <span className="bg-emerald-50 px-2 py-0.5 rounded text-[8px] font-bold text-brand-emerald border border-brand-emerald/20">جديد</span>}
                      {p.isOffer && <span className="bg-purple-50 px-2 py-0.5 rounded text-[8px] font-bold text-purple-800 border border-purple-200">عرض خاص</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 hover:bg-amber-100 transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 bg-red-50 text-red-800 rounded-lg border border-red-100 hover:bg-red-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-brand-dark/40 text-xs">لا توجد منتجات مطابقة لخيارات البحث.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-brand-gold/25 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-gold/15 flex items-center justify-between bg-brand-emerald text-white">
              <h3 className="text-lg font-bold text-brand-gold">
                {modalMode === 'create' ? 'إضافة قطعة مجوهرات جديدة للكتالوج' : 'تعديل تفاصيل قطعة المجوهرات'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Right side: Arabic / English Metadata */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark/70">التصنيف القسم *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer"
                      required
                    >
                      <option value="">اختر التصنيف الرئيسي...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark/70">الاسم باللغة العربية *</label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder="مثال: طقم ذهب زمرد عيار 21"
                      className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark/70">الاسم باللغة الإنجليزية *</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. 21k Gold Emerald Set"
                      className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs text-left direction-ltr focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark/70">الوصف بالعربية</label>
                    <textarea
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      placeholder="تفاصيل الحجر، الطول، نوع السلسلة..."
                      rows={3}
                      className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-dark/70">الوصف بالإنجليزية</label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Details of stones, chains, lock type..."
                      rows={3}
                      className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs text-left direction-ltr focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-dark/70">حالة التوفر</label>
                      <select
                        value={availabilityStatus}
                        onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="AVAILABLE">متوفر</option>
                        <option value="OUT_OF_STOCK">نفذت الكمية</option>
                        <option value="BY_ORDER">تحت الطلب</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-dark/70">نوع الأحجار</label>
                      <input
                        type="text"
                        value={stoneType}
                        onChange={(e) => setStoneType(e.target.value)}
                        placeholder="مثال: ألماس، زيركون، بدون"
                        className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Left side: Physical Properties, Price calculation & Images */}
                <div className="space-y-4">
                  <div className="bg-brand-bg/60 p-4 border border-brand-gold/15 rounded-xl space-y-3">
                    <h4 className="text-xs font-black text-brand-emerald flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-brand-gold" />
                      <span>الحساب التقديري الذكي للسعر اليومي</span>
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-brand-dark/60 font-bold block mb-1">العيار اليومي</label>
                        <select
                          value={karat}
                          onChange={(e) => setKarat(parseInt(e.target.value) || 21)}
                          className="w-full px-2 py-1.5 bg-white border border-brand-gold/20 rounded text-xs focus:outline-none"
                        >
                          <option value="18">عيار 18</option>
                          <option value="21">عيار 21</option>
                          <option value="24">عيار 24</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-brand-dark/60 font-bold block mb-1">الوزن (جرام) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-white border border-brand-gold/20 rounded text-xs focus:outline-none text-center"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-brand-dark/60 font-bold block mb-1">المصنعية/جرام *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={makingCost}
                          onChange={(e) => setMakingCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-white border border-brand-gold/20 rounded text-xs focus:outline-none text-center"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-brand-emerald text-white p-3 rounded-lg flex items-center justify-between text-xs mt-2 border border-brand-gold/20">
                      <div>
                        <span>سعر جرام الذهب للعيار:</span>
                        <span className="font-bold text-brand-gold block font-mono text-sm">{getGoldPriceForKarat(karat)} د.ل / ج</span>
                      </div>
                      <div className="text-left">
                        <span>السعر الإجمالي المقدر:</span>
                        <span className="font-black text-brand-gold block font-mono text-base">{calculatedPrice.toFixed(2)} د.ل</span>
                      </div>
                    </div>
                  </div>

                  {/* Flag Toggles */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-brand-bg/20 p-3 rounded-xl border border-brand-gold/10">
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-brand-gold" />
                      <span>قطعة مميزة (Featured)</span>
                    </label>
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="rounded text-brand-gold" />
                      <span>الأكثر مبيعاً</span>
                    </label>
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="rounded text-brand-gold" />
                      <span>وصول جديد (New)</span>
                    </label>
                    <label className="flex items-center gap-2 select-none cursor-pointer">
                      <input type="checkbox" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} className="rounded text-brand-gold" />
                      <span>تحت العروض والتخفيض</span>
                    </label>
                  </div>

                  {/* Image Uploader & Manager */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark/70 block">صور القطعة</label>
                    
                    {/* For existing product, manage uploaded images */}
                    {modalMode === 'edit' && productImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {productImages.map((img) => (
                          <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-gold/25 group">
                            <img src={api.imageUrl(img.imageUrl)} alt="Product" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="absolute inset-0 bg-red-900/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selector */}
                    <div className="flex justify-center px-6 pt-4 pb-5 border-2 border-brand-gold/20 border-dashed rounded-xl bg-brand-bg/30">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-8 w-8 text-brand-gold" />
                        <div className="flex text-xs text-brand-dark/60 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-bold text-brand-emerald hover:text-brand-emerald/80 px-1">
                            <span>{modalMode === 'create' ? 'اختر صوراً لتحميلها' : 'إضافة صور إضافية'}</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={(e) => {
                                if (modalMode === 'create') {
                                  setTempImageFiles(e.target.files);
                                } else {
                                  handleUploadMoreImages(e);
                                }
                              }}
                              className="sr-only" 
                            />
                          </label>
                        </div>
                        {modalMode === 'create' && tempImageFiles && (
                          <p className="text-xs text-brand-emerald font-semibold mt-1">تم اختيار {tempImageFiles.length} ملفات</p>
                        )}
                        {uploadingImages && (
                          <p className="text-xs text-brand-gold font-bold animate-pulse mt-1">جاري رفع الملفات...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t border-brand-gold/15 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-brand-gold/20 text-brand-dark hover:bg-brand-bg/40 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold font-bold text-xs rounded-lg shadow-lg hover:shadow-brand-gold/10 transition cursor-pointer"
                >
                  {modalMode === 'create' ? 'إضافة المنتج' : 'تعديل وحفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
