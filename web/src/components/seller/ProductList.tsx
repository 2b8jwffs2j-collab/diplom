import { Camera, Edit, Image as ImageIcon, Package, Trash2 } from 'lucide-react';
import { formatPrice } from '../../lib/cart';
import Pagination from '../admin/Pagination';

interface ProductListProps {
  products: any[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
  statusBadge: (status: string) => React.ReactNode;
}

function ProductList({
  products,
  currentPage,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  statusBadge,
}: ProductListProps) {
  const parseImageUrls = (product: any): string[] => {
    let imageUrls: string[] = [];
    if (product.imageUrls) {
      if (typeof product.imageUrls === 'string') {
        try {
          imageUrls = JSON.parse(product.imageUrls);
        } catch {
          imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        }
      } else if (Array.isArray(product.imageUrls)) {
        imageUrls = product.imageUrls;
      }
    }
    return imageUrls;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Бүтээгдэхүүн байхгүй байна</p>
        <p className="text-sm text-gray-500 mt-2">
          Дээрх &quot;Бүтээгдэхүүн нэмэх&quot; товч дараад эхлээрэй
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="divide-y divide-gray-200">
        {paginatedProducts.map((product: any) => {
          const imageUrls = parseImageUrls(product);

          return (
            <div key={product.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center space-x-4">
                {/* Icon or Image */}
                <div className="flex-shrink-0">
                  {imageUrls && imageUrls.length > 0 && imageUrls[0] ? (
                    <img
                      src={imageUrls[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {product.description || 'Тайлбар байхгүй'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      {product.originalPrice && product.discount && product.discount > 0 ? (
                        <>
                          <span className="text-blue-600 font-bold text-lg">
                            {formatPrice(product.price)}₮
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.originalPrice)}₮
                          </span>
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            -{product.discount}%
                          </span>
                        </>
                      ) : (
                        <span className="text-blue-600 font-bold text-lg">
                          {formatPrice(product.price)}₮
                        </span>
                      )}
                    </div>
                    <span className="flex items-center space-x-1 text-gray-600 text-sm">
                      <Package className="w-4 h-4" />
                      <span>Нөөц: {product.stock}</span>
                    </span>
                    {statusBadge(product.status)}
                    {imageUrls && imageUrls.length > 0 && (
                      <span className="flex items-center space-x-1 text-xs text-gray-500">
                        <Camera className="w-3 h-3" />
                        <span>{imageUrls.length} зураг</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onEdit(product)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center space-x-1"
                    title="Засах"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Засах</span>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center space-x-1"
                    title="Устгах"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Устгах</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      {products.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={products.length}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

export default ProductList;
