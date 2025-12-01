import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Settings,
  Store,
  User,
  Package,
  Wallet as WalletIcon,
  Scissors,
  Repeat,
} from 'lucide-react';
import { GET_PRODUCTS, GET_CATEGORIES, ME } from '../lib/graphql';
import { isAuthenticated } from '../lib/auth';
import ProductCard from '../components/ProductCard';

function Home() {
  const navigate = useNavigate();
  const [heroSlide, setHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, {
    variables: { status: 'APPROVED' },
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: userData, loading: userLoading } = useQuery(ME, {
    skip: !isAuthenticated(),
    fetchPolicy: 'network-only', // Cache-аас биш, network-аас авах
  });
  console.log(categoriesData);

  // Admin нэвтрэсэн бол автоматаар admin panel руу redirect хийх
  useEffect(() => {
    if (!userLoading && userData?.me?.role === 'ADMIN') {
      navigate('/admin');
    }
  }, [userData?.me?.role, userLoading, navigate]);

  const heroSlides = [
    {
      title: 'Гар урлалын бүтээгдэхүүн',
      subtitle: 'Монголын гар урлалчдын бүтээлүүдийг нэг дороос',
      discount: 'Төрөл бүрийн хямдралтай',
      icon: Palette,
      bgColor: 'bg-blue-700',
    },
    {
      title: 'Нэхмэл эдлэл',
      subtitle: 'Гэрээс урласан ороолт, цамц, хантааз',
      discount: '50% хүртэл хямдарсан',
      icon: Repeat,
      bgColor: 'bg-indigo-700',
    },
    {
      title: 'Оёдол, даавуун эдлэл',
      subtitle: 'Гэрийн нөхцөлд хийсэн сэвсгэр, уян хатан эдлэл',
      discount: '30% хүртэл хямдарсан',
      icon: Scissors,
      bgColor: 'bg-green-700',
    },
    {
      title: 'Бэлэг дурсгалын зүйлс',
      subtitle: 'Хийцтэй, өвөрмөц гар урлалын бэлэг',
      discount: '20% хүртэл хямдарсан',
      icon: Package,
      bgColor: 'bg-purple-700',
    },
  ];

  const nextSlide = useCallback(() => {
    setHeroSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Auto-play carousel
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 2000); // 5 секунд тутамд

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextSlide]);

  return (
    <div className="bg-gray-50">
      {/* Hero Carousel Section - зөвхөн BUYER эсвэл нэвтэрээгүй хэрэглэгчдэд */}
      {(!userData?.me || userData?.me?.role === 'BUYER') && (
        <section
          className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>
          <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24 relative z-10">
            <div className="relative flex items-center justify-between">
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-0 sm:left-2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>

              {/* Content */}
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between px-8 sm:px-12 gap-4 ml-4 sm:gap-0">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs sm:text-sm md:text-base mb-2 opacity-90">
                    {heroSlides[heroSlide].subtitle}
                  </p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                    {heroSlides[heroSlide].title}
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                    {heroSlides[heroSlide].discount}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center space-x-2 bg-white text-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 animate-fade-in text-sm sm:text-base"
                  >
                    <span>Одоо худалдаж авах</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                <div className="hidden sm:flex items-center justify-center animate-scale-in">
                  {(() => {
                    const IconComponent = heroSlides[heroSlide].icon;
                    return (
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                        <IconComponent className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 text-white relative z-10 drop-shadow-2xl" />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="absolute right-0 sm:right-2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all shadow-lg hover:shadow-xl hover:scale-110"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setHeroSlide(index)}
                  className={`h-2 rounded-full transition ${
                    index === heroSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Role-based Welcome Banner */}
      {userData?.me && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-6 sm:py-8 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {userData.me.role === 'ADMIN' && (
                    <>
                      <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow-md">
                        <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Сайн уу, Админ {userData.me.profile?.firstName || ''}!
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Бүтээгдэхүүн зөвшөөрөх, хэрэглэгч удирдах, сайтыг удирдах
                        </p>
                      </div>
                    </>
                  )}
                  {userData.me.role === 'SELLER' && (
                    <>
                      <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow-md">
                        <Store className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Сайн уу, {userData.me.profile?.firstName || 'Худалдагч'}!
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Бүтээгдэхүүн нэмэх, захиалга харах, орлого удирдах
                        </p>
                      </div>
                    </>
                  )}
                  {userData.me.role === 'BUYER' && (
                    <>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          Сайн уу, {userData.me.profile?.firstName || 'Худалдан авагч'}!
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Гар урлалын бүтээгдэхүүн худалдаж авах, захиалга харах
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
                  {userData.me.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <span>Админ самбар</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                  {userData.me.role === 'SELLER' && (
                    <Link
                      to="/seller"
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <span className="hidden sm:inline">Худалдагч самбар</span>
                      <span className="sm:hidden">Самбар</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                  {userData.me.role === 'BUYER' && (
                    <Link
                      to="/wallet"
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <WalletIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        <span className="hidden sm:inline">Wallet: </span>
                        {userData.me.wallet
                          ? (parseInt(userData.me.wallet.balance) / 100).toFixed(0)
                          : '0'}
                        ₮
                      </span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Categories Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Онцлох ангилал</h2>
            <Link
              to="/products"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold transition-all hover:scale-105 text-sm sm:text-base"
            >
              <span>Бүгдийг үзэх</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
          <div className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {categoriesData?.categories.map((category: any) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="flex flex-col items-center space-y-2 sm:space-y-3 min-w-[100px] sm:min-w-[120px] group animate-fade-in flex-shrink-0"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 flex items-center justify-center transition-all shadow-md group-hover:shadow-lg transform group-hover:scale-110">
                  <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Онцлох бүтээгдэхүүн</h2>
            <Link
              to="/products"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold transition-all hover:scale-105 text-sm sm:text-base"
            >
              <span>Бүгдийг үзэх</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

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
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {productsData?.products
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((product: any) => {
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        discountPercent={product.discount || undefined}
                        originalPrice={product.originalPrice}
                      />
                    );
                  })}
              </div>
              {/* Pagination */}
              {productsData?.products && productsData.products.length > itemsPerPage && (
                <div className="flex items-center justify-center mt-8 space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil((productsData.products.length || 0) / itemsPerPage)
                        ),
                      },
                      (_, i) => {
                        const totalPages = Math.ceil(
                          (productsData.products.length || 0) / itemsPerPage
                        );
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
                      }
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          Math.ceil((productsData.products.length || 0) / itemsPerPage),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentPage >= Math.ceil((productsData.products.length || 0) / itemsPerPage)
                    }
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 gradient-text">
            Яаж ажилладаг вэ?
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
            3 энгийн алхам
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all transform hover:scale-105 border border-gray-100 animate-slide-up">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">
                1. Бүртгүүлэх
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Хялбар бүртгэл — худалдагч эсвэл худалдан авагч
              </p>
            </div>
            <div
              className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all transform hover:scale-105 border border-gray-100 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-blue-600 rounded-2xl shadow-lg">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">
                2. Бүтээгдэхүүн оруулах
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Зураг, тайлбар, үнэ оруулаад админ зөвшөөрнө
              </p>
            </div>
            <div
              className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all transform hover:scale-105 border border-gray-100 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-blue-600 rounded-2xl shadow-lg">
                  <WalletIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">
                3. Худалдаа хийх
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Wallet цэнэглээд бүтээгдэхүүн худалдаж авах
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
