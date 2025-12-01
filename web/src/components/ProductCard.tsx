import { Link, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Heart,
  Eye,
  Star,
  ShoppingCart,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useMutation, useQuery } from '@apollo/client';
import { formatPrice, addToCart } from '../lib/cart';
import { CREATE_STOCK_REQUEST, ME, MY_STOCK_REQUESTS } from '../lib/graphql';
import { isAuthenticated } from '../lib/auth';
import { useState } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';

interface Product {
  id: number;
  name: string;
  price: string;
  imageUrls?: string[];
  stock?: number;
  seller?: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
  averageRating?: number;
  reviewCount?: number;
}

interface ProductCardProps {
  product: Product;
  discountPercent?: number;
  originalPrice?: string;
}

function ProductCard({ product, discountPercent, originalPrice }: ProductCardProps) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [requestingStock, setRequestingStock] = useState(false);
  const imageUrl = product.imageUrls?.[0];
  const hasImage = imageUrl && imageUrl.length > 0;
  const isOutOfStock = product.stock === 0 || product.stock === undefined;

  const { data: meData } = useQuery(ME, {
    skip: !isAuthenticated(),
  });
  const isSeller = meData?.me?.role === 'SELLER';

  const { data: myStockRequestsData } = useQuery(MY_STOCK_REQUESTS, {
    skip: !isAuthenticated() || isSeller,
  });

  // Энэ бүтээгдэхүүнд зөвшөөрөгдсөн хүсэлт байгаа эсэхийг шалгах
  const approvedRequest = myStockRequestsData?.myStockRequests?.find(
    (req: any) => req.product.id === product.id && req.status === 'APPROVED'
  );

  const pendingRequest = myStockRequestsData?.myStockRequests?.find(
    (req: any) => req.product.id === product.id && req.status === 'PENDING'
  );

  const [createStockRequest] = useMutation(CREATE_STOCK_REQUEST, {
    refetchQueries: [{ query: MY_STOCK_REQUESTS }],
    onCompleted: () => {
      toast.success('Урдчилан захиалах хүсэлт илгээгдлээ!');
      setRequestingStock(false);
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
      setRequestingStock(false);
    },
  });

  const handlePreOrder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('Нэвтрэх шаардлагатай');
      navigate('/login');
      return;
    }

    setRequestingStock(true);
    await createStockRequest({
      variables: {
        productId: product.id,
        quantity: 1,
      },
    });
  };

  const priceNum = parseInt(product.price) / 100;
  const originalPriceNum = originalPrice ? parseInt(originalPrice) / 100 : null;
  const discount =
    discountPercent ||
    (originalPriceNum
      ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
      : null);

  // Хуучин үнийг тооцоолох: originalPrice байвал түүнийг, эсвэл discountPercent байвал тооцоолно
  const calculatedOriginalPrice = originalPriceNum
    ? originalPriceNum
    : discountPercent && discountPercent > 0
      ? priceNum / (1 - discountPercent / 100)
      : null;

  // Хэмнэлтийг тооцоолох
  const saved = calculatedOriginalPrice ? calculatedOriginalPrice - priceNum : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products/${product.id}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0 || product.stock === undefined) {
      toast.error('Энэ бүтээгдэхүүн нөөцөд байхгүй байна');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: imageUrl,
      stock: product.stock || 0,
    });

    toast.success('Сагсанд нэмэгдлээ!');
  };

  const rating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-large transition-all duration-300 transform hover:scale-[1.02] hover:border-blue-200">
      <Link to={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <ImageIcon className="w-20 h-20 text-gray-400 group-hover:text-gray-500 transition-colors" />
          )}

          {/* Discount Badge */}
          {discount && discount > 0 && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
              {discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
              isWishlisted
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-600'
            } opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View & Add to Cart Buttons - Show on Hover */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <button
                  onClick={handleQuickView}
                  className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 hover:scale-110 transition-all"
                  title="Хурдан үзэх"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all"
                  title="Сагсанд нэмэх"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Stock Badge */}
          {isOutOfStock ? (
            <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-md z-10 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Дууссан
            </div>
          ) : (
            product.stock !== undefined &&
            product.stock > 0 &&
            product.stock < 5 && (
              <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md z-10">
                Зөвхөн {product.stock} үлдсэн
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Seller Name */}
          {product.seller?.profile?.firstName && (
            <p className="text-xs text-gray-500 mb-1.5 truncate">
              {product.seller.profile.firstName}
              {product.seller.profile.lastName && ` ${product.seller.profile.lastName}`}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(rating) ? 'text-blue-600 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({rating.toFixed(1)}) {reviewCount > 0 && `· ${reviewCount}`}
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="space-y-1.5">
            {/* Current Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₮{formatPrice(product.price)}</span>
              {calculatedOriginalPrice && calculatedOriginalPrice > priceNum && (
                <span className="text-sm text-gray-400 line-through">
                  ₮{Math.round(calculatedOriginalPrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Savings */}
            {saved && saved > 0 && (
              <p className="text-xs text-blue-700 font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-1 rounded-md inline-block">
                Хэмнэлт - ₮{saved.toFixed(0)}
              </p>
            )}
          </div>

          {/* Out of Stock Message */}
          {isOutOfStock && !isSeller && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Бүтээгдэхүүн дууссан
              </p>

              {/* Approved Request - Show expected date */}
              {approvedRequest?.expectedCompletionDate ? (
                <div className="w-full text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg font-medium">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">Зөвшөөрөгдсөн</span>
                  </div>
                  <p className="text-[10px] text-green-600">
                    Дуусах огноо:{' '}
                    {dayjs(approvedRequest.expectedCompletionDate)
                      .locale('mn')
                      .format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
              ) : pendingRequest ? (
                <div className="w-full text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg font-medium">
                  Хүсэлт хүлээгдэж байна...
                </div>
              ) : (
                <button
                  onClick={handlePreOrder}
                  disabled={requestingStock}
                  className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingStock ? 'Илгээж байна...' : 'Урдчилан захиалах хүсэлт илгээх'}
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
