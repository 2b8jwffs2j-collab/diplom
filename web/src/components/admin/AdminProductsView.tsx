import { useState } from 'react';
import { Image as ImageIcon, Check, Trash, Grid3x3, List, Search } from 'lucide-react';
import { formatPrice } from '../../lib/cart';
import Pagination from './Pagination';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrls?: string[];
  seller?: {
    profile?: {
      firstName?: string;
    };
    email?: string;
  };
}

interface AdminProductsViewProps {
  products: Product[];
  loading: boolean;
  statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
  onStatusFilterChange: (status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL') => void;
  onApprove: (id: number) => void;
  onReject: (id: number, productName: string) => void;
  onDelete: (id: number, productName: string) => void;
}

function AdminProductsView({
  products,
  loading,
  statusFilter,
  onStatusFilterChange,
  onApprove,
  onReject,
  onDelete,
}: AdminProductsViewProps) {
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [productSearchFilter, setProductSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter products by search term
  const filteredProducts = products.filter((product) => {
    if (!productSearchFilter.trim()) return true;
    const searchTerm = productSearchFilter.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.seller?.profile?.firstName?.toLowerCase().includes(searchTerm) ||
      product.seller?.email?.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Toolbar: Search, View Mode, Status Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Filter */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={productSearchFilter}
            onChange={(e) => {
              setProductSearchFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Бүтээгдэхүүн хайх..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setProductViewMode('grid')}
            className={`p-2 rounded transition ${
              productViewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setProductViewMode('list')}
            className={`p-2 rounded transition ${
              productViewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 border-b border-gray-200">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusFilterChange(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-sm font-medium transition ${
                statusFilter === status
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'PENDING' && 'Хүлээгдэж буй'}
              {status === 'APPROVED' && 'Зөвшөөрөгдсөн'}
              {status === 'REJECTED' && 'Татгалзсан'}
              {status === 'ALL' && 'Бүгд'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">Бүтээгдэхүүн олдсонгүй</p>
        </div>
      ) : productViewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="absolute top-1 left-1">
                    {product.status === 'PENDING' && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Хүлээгдэж буй
                      </span>
                    )}
                    {product.status === 'APPROVED' && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Зөвшөөрөгдсөн
                      </span>
                    )}
                    {product.status === 'REJECTED' && (
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Татгалзсан
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2">
                  <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">{product.description}</p>
                  <div className="mb-2">
                    <div className="text-sm font-bold text-gray-900">
                      {formatPrice(product.price)}₮
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {product.seller?.profile?.firstName || 'Хэрэглэгч'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {product.status === 'PENDING' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onApprove(product.id)}
                          className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                          title="Зөвшөөрөх"
                        >
                          <Check className="w-3 h-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => onReject(product.id, product.name)}
                          className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                          title="Татгалзах"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                    {product.status === 'APPROVED' && (
                      <button
                        onClick={() => onReject(product.id, product.name)}
                        className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                      >
                        Татгалзах
                      </button>
                    )}
                    {product.status === 'REJECTED' && (
                      <button
                        onClick={() => onApprove(product.id)}
                        className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                      >
                        Зөвшөөрөх
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(product.id, product.name)}
                      className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition flex items-center justify-center space-x-1"
                    >
                      <Trash className="w-3 h-3" />
                      <span>Устгах</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Зураг
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Нэр
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Тайлбар
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Үнэ
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Худалдагч
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {product.imageUrls?.[0] ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="font-medium text-xs sm:text-sm text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatPrice(product.price)}₮
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="text-xs sm:text-sm text-gray-600">
                          {product.seller?.profile?.firstName || product.seller?.email || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {product.status === 'PENDING' && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Хүлээгдэж буй
                          </span>
                        )}
                        {product.status === 'APPROVED' && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Зөвшөөрөгдсөн
                          </span>
                        )}
                        {product.status === 'REJECTED' && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Татгалзсан
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          {product.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => onApprove(product.id)}
                                className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                              >
                                Зөвшөөрөх
                              </button>
                              <button
                                onClick={() => onReject(product.id, product.name)}
                                className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                              >
                                Татгалзах
                              </button>
                            </>
                          )}
                          {product.status === 'APPROVED' && (
                            <button
                              onClick={() => onReject(product.id, product.name)}
                              className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                            >
                              Татгалзах
                            </button>
                          )}
                          {product.status === 'REJECTED' && (
                            <button
                              onClick={() => onApprove(product.id)}
                              className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition"
                            >
                              Зөвшөөрөх
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(product.id, product.name)}
                            className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-blue-700 transition flex items-center space-x-1"
                          >
                            <Trash className="w-3 h-3" />
                            <span className="hidden sm:inline">Устгах</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default AdminProductsView;
