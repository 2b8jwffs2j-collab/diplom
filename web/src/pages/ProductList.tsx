import { useQuery } from '@apollo/client';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ProductCard from '../components/ProductCard';
import { GET_CATEGORIES, GET_PRODUCTS } from '../lib/graphql';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

function ProductList() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  // URL-аас category parameter уншаад тооцоолох (useMemo ашиглах)
  const categoryId = useMemo(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const categoryIdNum = parseInt(categoryParam, 10);
      return !isNaN(categoryIdNum) ? categoryIdNum : undefined;
    }
    return undefined;
  }, [searchParams]);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, {
    variables: {
      status: 'APPROVED',
      search: search || undefined,
      categoryId,
    },
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData?.products) return [];

    let filtered = [...productsData.products];

    // Price filter
    if (priceMin) {
      const minCents = Math.round(parseFloat(priceMin) * 100);
      filtered = filtered.filter((p: any) => parseInt(p.price) >= minCents);
    }
    if (priceMax) {
      const maxCents = Math.round(parseFloat(priceMax) * 100);
      filtered = filtered.filter((p: any) => parseInt(p.price) <= maxCents);
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-low':
          return parseInt(a.price) - parseInt(b.price);
        case 'price-high':
          return parseInt(b.price) - parseInt(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [productsData, sortBy, priceMin, priceMax]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = e.target.value ? parseInt(e.target.value) : undefined;
    const newSearchParams = new URLSearchParams(searchParams);
    if (newCategoryId) {
      newSearchParams.set('category', newCategoryId.toString());
    } else {
      newSearchParams.delete('category');
    }
    // URL шинэчлэх нь categoryId-ийг автоматаар шинэчлэнэ (useMemo-оор)
    const newUrl = newSearchParams.toString()
      ? `${window.location.pathname}?${newSearchParams.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    // Force re-render by triggering searchParams change
    searchParams.set('category', newCategoryId?.toString() || '');
    setCurrentPage(1);
  };

  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceMin(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceMax(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Бүх бүтээгдэхүүн</h1>
        <BackButton />
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Хайх</label>
            <input
              type="text"
              placeholder="Нэр, материал..."
              value={search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ангилал</label>
              <select
                value={categoryId || ''}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              >
                <option value="">Бүгд</option>
                {categoriesData?.categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хамгийн бага үнэ (₮)
              </label>
              <input
                type="number"
                placeholder="0"
                value={priceMin}
                onChange={handlePriceMinChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хамгийн их үнэ (₮)
              </label>
              <input
                type="number"
                placeholder="∞"
                value={priceMax}
                onChange={handlePriceMaxChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Эрэмбэлэх</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              >
                <option value="newest">Шинэ эхэнд</option>
                <option value="price-low">Үнэ: Багаас их рүү</option>
                <option value="price-high">Үнэ: Ихээс бага руу</option>
                <option value="name">Нэр: А-Я</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(categoryId || priceMin || priceMax || search) && (
            <button
              onClick={() => {
                const newUrl = window.location.pathname;
                window.history.pushState({}, '', newUrl);
                searchParams.delete('category');
                setPriceMin('');
                setPriceMax('');
                setSearch('');
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 px-3 sm:px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
            >
              Бүх шүүлт цэвэрлэх
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg font-medium mb-2">Бүтээгдэхүүн олдсонгүй</p>
          <p className="text-gray-500 text-sm">Шүүлтүүдийг өөрчлөөд дахин оролдоно уу</p>
        </div>
      ) : (
        <>
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              <span className="text-blue-600 font-bold">{filteredAndSortedProducts.length}</span>{' '}
              бүтээгдэхүүн олдлоо
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {paginatedProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                discountPercent={product.discount || undefined}
                originalPrice={product.originalPrice}
              />
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-xs sm:text-sm text-gray-600">
                {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} /{' '}
                {filteredAndSortedProducts.length} бүтээгдэхүүн
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductList;
