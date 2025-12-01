import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { formatPrice } from '../../lib/cart';

interface OrderListProps {
  orders: any[];
  sellerId: number;
  onStatusChange: (orderId: number, newStatus: string) => void;
  orderStatusBadge: (status: string) => React.ReactNode;
}

function OrderList({ orders, sellerId, onStatusChange, orderStatusBadge }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600">Захиалга байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => {
        const sellerItems = order.items.filter((item: any) => item.product.seller.id === sellerId);
        const sellerTotal = sellerItems.reduce(
          (sum: number, item: any) => sum + parseInt(item.price) * item.quantity,
          0
        );

        return (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-gray-900">Захиалга #{order.id}</span>
                  {orderStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-600">
                  Худалдан авагч: {order.buyer.profile?.firstName || order.buyer.email}
                </p>
                <p className="text-sm text-gray-600">
                  Захиалгын огноо: {dayjs(order.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                </p>
                {order.status !== 'PENDING' && order.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Зөвшөөрсөн: {dayjs(order.updatedAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(sellerTotal.toString())}₮
                </div>
                <div className="text-sm text-gray-600">{sellerItems.length} бүтээгдэхүүн</div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4 space-y-2">
              {sellerItems.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 text-sm">
                  <img
                    src={item.product.imageUrls?.[0] || 'https://via.placeholder.com/50x50'}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-600">
                      {item.quantity} x {formatPrice(item.price)}₮
                    </p>
                  </div>
                  <div className="font-semibold">
                    {formatPrice((parseInt(item.price) * item.quantity).toString())}₮
                  </div>
                </div>
              ))}
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

            {/* Status Actions */}
            <div className="flex space-x-2">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => onStatusChange(order.id, 'CONFIRMED')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Баталгаажуулах
                </button>
              )}
              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => onStatusChange(order.id, 'SHIPPED')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Хүргэлтэд гаргах
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button
                  onClick={() => onStatusChange(order.id, 'DELIVERED')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Хүлээн авсан гэж тэмдэглэх
                </button>
              )}
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <button
                  onClick={() => onStatusChange(order.id, 'CANCELLED')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Цуцлах
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderList;
