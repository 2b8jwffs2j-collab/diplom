import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Image as ImageIcon, Check, Truck, Clock, PartyPopper } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { ORDER } from '../lib/graphql';
import { formatPrice } from '../lib/cart';
import { isAuthenticated } from '../lib/auth';
import BackButton from '../components/BackButton';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useQuery(ORDER, {
    variables: { id: parseInt(id!) },
    skip: !id || !isAuthenticated(),
  });

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Нэвтэрч орох шаардлагатай</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Нэвтрэх
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Захиалга олдсонгүй</h2>
        <Link
          to="/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Захиалга руу буцах
        </Link>
      </div>
    );
  }

  const order = data.order;

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      CONFIRMED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      SHIPPED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      DELIVERED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      CANCELLED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
    };
    const labels: Record<string, string> = {
      PENDING: 'Хүлээгдэж байна',
      CONFIRMED: 'Баталгаажсан',
      SHIPPED: 'Хүргэгдэж байна',
      DELIVERED: 'Хүргэгдсэн',
      CANCELLED: 'Цуцлагдсан',
    };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Status timeline
  const statusSteps = [
    { key: 'PENDING', label: 'Хүлээгдэж байна', icon: Clock },
    { key: 'CONFIRMED', label: 'Баталгаажсан', icon: Check },
    { key: 'SHIPPED', label: 'Хүргэлтэд гарсан', icon: Truck },
    { key: 'DELIVERED', label: 'Хүлээн авсан', icon: PartyPopper },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Захиалга #{order.id}</h1>
        <BackButton onClick={() => navigate('/orders')} />
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {statusBadge(order.status)}
          <span className="text-gray-600 text-sm">
            {dayjs(order.createdAt).locale('mn').format('YYYY оны MMMM сарын DD, HH:mm')}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Захиалгын статус</h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Status Steps */}
          <div className="relative flex items-start justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const IconComponent = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                  {/* Icon Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Label */}
                  <div
                    className={`text-xs sm:text-sm text-center font-medium ${
                      isCompleted ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалгын бүтээгдэхүүн</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => {
                const itemImage = item.product.imageUrls?.[0];
                const hasItemImage = itemImage && itemImage.length > 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 pb-4 border-b last:border-b-0"
                  >
                    {hasItemImage ? (
                      <img
                        src={itemImage}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        Тоо ширхэг: {item.quantity} x {formatPrice(item.price)}₮
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice((parseInt(item.price) * item.quantity).toString())}₮
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Захиалгын дэлгэрэнгүй</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Бүтээгдэхүүний дүн:</span>
                <span className="font-medium">
                  {formatPrice(
                    order.items
                      .reduce(
                        (sum: number, item: any) => sum + parseInt(item.price) * item.quantity,
                        0
                      )
                      .toString()
                  )}
                  ₮
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Хүргэлт:</span>
                <span className="font-medium">Үнэгүй</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                <span>Нийт:</span>
                <span className="text-blue-600">{formatPrice(order.totalAmount)}₮</span>
              </div>
            </div>

            {/* Shipping Address & Phone */}
            {(order.shippingAddress || order.phone) && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                {order.shippingAddress && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-1">Хүргэх хаяг:</p>
                    <p className="text-sm text-gray-600 mb-2">{order.shippingAddress}</p>
                  </>
                )}
                {order.phone && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-1">Утасны дугаар:</p>
                    <p className="text-sm text-gray-600 font-semibold">{order.phone}</p>
                  </>
                )}
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">Тэмдэглэл:</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Seller Info */}
            {order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Худалдагч:</p>
                {order.items.map((item: any, idx: number) => (
                  <p key={idx} className="text-sm text-gray-600">
                    {item.product.seller?.profile?.firstName || 'Худалдагч'}{' '}
                    {item.product.seller?.profile?.lastName || ''}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
