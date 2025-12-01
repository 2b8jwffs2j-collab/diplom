import ImageUpload from '../ImageUpload';

interface ProductFormProps {
  formData: {
    name: string;
    description: string;
    price: string;
    discount: string;
    stock: string;
    categoryId: string;
    imageUrls: string[];
    materials: string;
    timeToMake: string;
  };
  editingProduct: any;
  categories: any[];
  creating: boolean;
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function ProductForm({
  formData,
  editingProduct,
  categories,
  creating,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4">
        {editingProduct ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн нэмэх'}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нэр *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ноосон малгай"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Үнэ (₮) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="25000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нөөц (ширхэг) *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => onFormDataChange({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хямдрал (%){' '}
              <span className="text-xs text-gray-500">(сонголттой, 30% = 30 гэж бичих)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => onFormDataChange({ ...formData, discount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {formData.discount && parseFloat(formData.discount) > 0 && formData.price && (
              <p className="text-xs text-gray-500 mt-1">
                Хуучин үнэ: ₮
                {(parseFloat(formData.price) / (1 - parseFloat(formData.discount) / 100)).toFixed(
                  0
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал</label>
            <select
              value={formData.categoryId}
              onChange={(e) => onFormDataChange({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Сонгох</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тайлбар</label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Гараар нэхсэн дулаан малгай..."
          />
        </div>

        <div>
          <ImageUpload
            onUploadComplete={(urls) => onFormDataChange({ ...formData, imageUrls: urls })}
            maxFiles={10}
            existingImages={formData.imageUrls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Материал</label>
            <input
              type="text"
              value={formData.materials}
              onChange={(e) => onFormDataChange({ ...formData, materials: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Монгол ноос, утас"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хийхэд зарцуулсан хугацаа
            </label>
            <input
              type="text"
              value={formData.timeToMake}
              onChange={(e) => onFormDataChange({ ...formData, timeToMake: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="2 өдөр"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={creating}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {creating ? 'Хадгалж байна...' : editingProduct ? 'Хадгалах' : 'Нэмэх'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Цуцлах
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
