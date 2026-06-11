import React, { useEffect, useState } from 'react';
import { api, type Category } from '../services/api';
import { Plus, Trash2, Edit, Save, X, ToggleLeft, ToggleRight, ImageIcon } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating new category
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
      setError('فشل تحميل التصنيفات من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) {
      alert('يرجى كتابة اسم التصنيف باللغة العربية والإنجليزية');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('nameAr', nameAr.trim());
      formData.append('nameEn', nameEn.trim());
      formData.append('sortOrder', sortOrder.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.createCategory(formData);
      
      // Reset form
      setNameAr('');
      setNameEn('');
      setSortOrder(0);
      setImageFile(null);
      
      // Refresh list
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إضافة التصنيف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setEditNameAr(cat.nameAr);
    setEditNameEn(cat.nameEn);
    setEditSortOrder(cat.sortOrder);
    setEditIsActive(cat.isActive);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editNameAr.trim() || !editNameEn.trim()) {
      alert('الرجاء تعبئة الأسماء بشكل صحيح');
      return;
    }

    try {
      await api.updateCategory(editingId, editNameAr.trim(), editNameEn.trim(), editSortOrder, editIsActive);
      setEditingId(null);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تعديل التصنيف');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع المنتجات المرتبطة به!')) return;
    try {
      await api.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'فشل حذف التصنيف');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-brand-emerald rounded-full animate-spin" />
        <p className="text-brand-emerald font-medium">جاري تحميل التصنيفات...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create New Category Panel */}
      <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm h-fit">
        <h3 className="text-lg font-bold text-brand-emerald mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-brand-gold" />
          <span>إضافة تصنيف جديد</span>
        </h3>
        
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">اسم التصنيف (بالعربية)</label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: أطقم أعراس، خواتم ألماس"
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">اسم التصنيف (بالإنجليزية)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Wedding Sets, Diamond Rings"
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm text-left direction-ltr focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70">ترتيب العرض</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-gold/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark/70 block">صورة الغلاف للتصنيف</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-brand-gold/20 border-dashed rounded-xl bg-brand-bg/30">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-brand-gold" />
                <div className="flex text-xs text-brand-dark/60">
                  <label className="relative cursor-pointer bg-white rounded-md font-bold text-brand-emerald hover:text-brand-emerald/80 focus-within:outline-none px-1">
                    <span>تحميل صورة</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="sr-only" 
                    />
                  </label>
                </div>
                <p className="text-[10px] text-brand-dark/40">JPEG, PNG, WEBP حتى 5MB</p>
                {imageFile && (
                  <p className="text-xs text-brand-emerald font-bold truncate max-w-[200px] mt-1">{imageFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald/90 text-brand-gold font-bold text-sm rounded-lg shadow-md transition duration-150 cursor-pointer"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ التصنيف'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl p-6 border border-brand-gold/15 shadow-sm lg:col-span-2 space-y-4">
        <h3 className="text-lg font-bold text-brand-emerald m-0">قائمة التصنيفات الحالية</h3>
        <p className="text-xs text-brand-dark/50">عرض وتعديل أو حذف التصنيفات المعروضة للزبائن في التطبيق.</p>
        
        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-200">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-brand-dark">
            <thead className="text-xs font-black uppercase bg-brand-bg/60 text-brand-emerald border-b border-brand-gold/10">
              <tr>
                <th className="px-4 py-3">الصورة</th>
                <th className="px-4 py-3">اسم التصنيف (عربي/إنجليزي)</th>
                <th className="px-4 py-3">الترتيب</th>
                <th className="px-4 py-3">المنتجات</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/10">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;
                return (
                  <tr key={cat.id} className="hover:bg-brand-bg/20 transition-colors">
                    <td className="px-4 py-3">
                      {cat.image ? (
                        <img 
                          src={api.imageUrl(cat.image)} 
                          alt={cat.nameAr} 
                          className="w-12 h-12 object-cover rounded-lg border border-brand-gold/25"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-bg/60 border border-dashed border-brand-gold/20 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-brand-gold/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={editNameAr} 
                            onChange={(e) => setEditNameAr(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-brand-gold/30 rounded text-xs"
                          />
                          <input 
                            type="text" 
                            value={editNameEn} 
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-brand-gold/30 rounded text-xs text-left direction-ltr"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-brand-dark m-0">{cat.nameAr}</p>
                          <span className="text-xs text-brand-dark/40">{cat.nameEn}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editSortOrder} 
                          onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-white border border-brand-gold/30 rounded text-xs text-center"
                        />
                      ) : (
                        cat.sortOrder
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-emerald">
                      {cat._count?.products || 0}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditIsActive(!editIsActive)}
                          className="text-brand-emerald"
                        >
                          {editIsActive ? (
                            <ToggleRight className="w-8 h-8 text-brand-emerald cursor-pointer" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-brand-dark/30 cursor-pointer" />
                          )}
                        </button>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cat.isActive ? 'نشط' : 'معطل'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={handleSaveEdit}
                              className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition cursor-pointer"
                              title="حفظ"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                              title="إلغاء"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(cat)}
                              className="p-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 hover:bg-amber-100 transition cursor-pointer"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 bg-red-50 text-red-800 rounded-lg border border-red-100 hover:bg-red-100 transition cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-brand-dark/40 text-xs">لا توجد تصنيفات مضافة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
