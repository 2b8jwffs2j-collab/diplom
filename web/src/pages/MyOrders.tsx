import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { Image as ImageIcon, Package, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { MY_ORDERS } from '../lib/graphql';
import { formatPrice } from '../lib/cart';
import { isAuthenticated } from '../lib/auth';
import BackButton from '../components/BackButton';
import RefundRequestDialog from '../components/RefundRequestDialog';

function MyOrders() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  const { data, loading, refetch } = useQuery(MY_ORDERS, {
    skip: !isAuthenticated(),
  });

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Нэвтэрч орох шаардлагатай</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
        >
          Нэвтрэх
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const orders = data?.myOrders || [];

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
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          colors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Package className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Миний захиалгууд</h1>
        </div>
        <BackButton />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-6">Захиалга байхгүй байна</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
          >
            Бүтээгдэхүүн үзэх
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Захиалга #{order.id}</h3>
                  <p className="text-sm text-gray-600">
                    {dayjs(order.createdAt).locale('mn').format('YYYY-MM-DD')}
                  </p>
                </div>
                <div className="text-right">
                  {statusBadge(order.status)}
                  <p className="text-xl font-bold text-primary-500 mt-2">
                    {formatPrice(order.totalAmount)}₮
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Бүтээгдэхүүнүүд:</h4>
                <div className="space-y-2">
                  {order.items.map((item: any) => {
                    const itemImage = item.product.imageUrls?.[0];
                    const hasItemImage = itemImage && itemImage.length > 0;
                    return (
                      <div key={item.id} className="flex items-center space-x-4">
                        {hasItemImage ? (
                          <img
                            src={itemImage}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x {formatPrice(item.price)}₮
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Хүргэлтийн хаяг:</h4>
                  <p className="text-gray-700">{order.shippingAddress}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 mt-4 flex items-center justify-between">
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Дэлгэрэнгүй харах →
                </Link>
                {order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsRefundDialogOpen(true);
                    }}
                    className="inline-flex items-center space-x-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition text-sm font-medium border border-orange-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Буцаалт хүсэх</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refund Request Dialog */}
      {selectedOrder && (
        <RefundRequestDialog
          order={selectedOrder}
          isOpen={isRefundDialogOpen}
          onClose={() => {
            setIsRefundDialogOpen(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}

export default MyOrders;
