import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { Image as ImageIcon, Check, ShoppingCart, Plus } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { GET_PRODUCT, PRODUCT_REVIEWS, CREATE_REVIEW, ME } from '../lib/graphql';
import { addToCart, formatPrice } from '../lib/cart';
import { isAuthenticated } from '../lib/auth';
import BackButton from '../components/BackButton';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data, loading, refetch } = useQuery(GET_PRODUCT, {
    variables: { id: parseInt(id!) },
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery(PRODUCT_REVIEWS, {
    variables: { productId: parseInt(id!) },
    skip: !id,
  });

  const { data: userData } = useQuery(ME, { skip: !isAuthenticated() });

  // Одоогийн хэрэглэгчийн үнэлгээний тоог тоолох
  const currentUserReviewCount =
    reviewsData?.productReviews?.filter((review: any) => review.user?.id === userData?.me?.id)
      .length || 0;
  const canWriteReview = currentUserReviewCount < 3;

  const [createReview, { loading: creatingReview }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      toast.success('Үнэлгээ амжилттай нэмэгдлээ!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      refetch();
      refetchReviews();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleAddToCart = () => {
    if (!data?.product) return;

    const product = data.product;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrls?.[0],
      stock: product.stock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Бүтээгдэхүүн олдсонгүй</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          Буцах
        </button>
      </div>
    );
  }

  const product = data.product;
  const mainImage = product.imageUrls?.[0];
  const hasImage = mainImage && mainImage.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Image */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {hasImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-24 h-24 sm:w-32 sm:h-32 text-gray-400" />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>
            <BackButton />
          </div>
          {/* Price */}
          <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-3 sm:mb-4">
            {formatPrice(product.price)}₮
          </div>

          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center mb-4">
              <span className="text-blue-600 text-2xl">★</span>
              <span className="text-lg text-gray-700 ml-2">
                {product.averageRating.toFixed(1)} ({product.reviewCount || 0} үнэлгээ)
              </span>
            </div>
          )}

          {/* Stock */}
          <div className="mb-4">
            {product.stock > 0 ? (
              <span className="flex items-center space-x-1 text-blue-600 font-medium">
                <Check className="w-4 h-4" />
                <span>Нөөцөд байгаа ({product.stock} ширхэг)</span>
              </span>
            ) : (
              <span className="text-blue-700 font-medium">✗ Дууссан</span>
            )}
          </div>

          {/* Seller */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Худалдагч</h3>
            <p className="text-gray-700">
              {product.seller.profile?.firstName} {product.seller.profile?.lastName}
            </p>
            {product.seller.profile?.bio && (
              <p className="text-sm text-gray-600 mt-2">{product.seller.profile.bio}</p>
            )}
          </div>

          {/* Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Тоо ширхэг</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
                  }
                  className="w-full sm:w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <div className="flex-1">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        Нэмэгдсэн!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Сагсанд нэмэх
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Тайлбар</h3>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Details */}
          {product.materials && (
            <div className="mb-4">
              <span className="font-semibold text-gray-800">Материал:</span>
              <span className="text-gray-700 ml-2">{product.materials}</span>
            </div>
          )}
          {product.timeToMake && (
            <div className="mb-4">
              <span className="font-semibold text-gray-800">Хийхэд зарцуулсан хугацаа:</span>
              <span className="text-gray-700 ml-2">{product.timeToMake}</span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 sm:mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl font-bold">Үнэлгээ</h2>
          {isAuthenticated() && userData?.me?.role === 'BUYER' && (
            <>
              {canWriteReview ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-medium"
                >
                  {showReviewForm ? (
                    'Хаах'
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        {' Үнэлгээ бичих'}
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 sm:px-4 py-2 rounded-lg">
                  Та хамгийн ихдээ 3 үнэлгээ бичиж болохгүй
                </div>
              )}
            </>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && isAuthenticated() && canWriteReview && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Үнэлгээ бичих</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reviewComment.trim()) {
                  toast.error('Сэтгэгдэл бичнэ үү!');
                  return;
                }
                if (!canWriteReview) {
                  toast.error('Та хамгийн ихдээ 3 үнэлгээ бичих боломжтой!');
                  return;
                }
                await createReview({
                  variables: {
                    productId: parseInt(id!),
                    rating: reviewRating,
                    comment: reviewComment,
                  },
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Үнэлгээ</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl ${
                        star <= reviewRating ? 'text-blue-600' : 'text-gray-300'
                      } hover:text-blue-600 transition`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сэтгэгдэл</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Таны сэтгэгдэл..."
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="submit"
                  disabled={creatingReview}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-sm sm:text-base"
                >
                  {creatingReview ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewRating(5);
                    setReviewComment('');
                  }}
                  className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                >
                  Цуцлах
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviewsData?.productReviews && reviewsData.productReviews.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {reviewsData.productReviews.map((review: any) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 gap-2 sm:gap-0">
                  <span className="text-blue-600 text-base sm:text-lg">
                    {'★'.repeat(review.rating)}
                  </span>
                  <span className="text-gray-700 sm:ml-3 font-medium text-sm sm:text-base">
                    {review.user?.profile?.firstName || 'Хэрэглэгч'}{' '}
                    {review.user?.profile?.lastName || ''}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm sm:ml-auto">
                    {dayjs(review.createdAt).format('YYYY-MM-DD')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm sm:text-base text-gray-700 mt-2 whitespace-pre-line">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm sm:text-base text-gray-600">Одоогоор үнэлгээ байхгүй байна</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
