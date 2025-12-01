import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { RotateCcw, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { formatPrice } from '../../lib/cart';

interface RefundRequestsViewProps {
  refundRequests: any[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function RefundRequestsView({ refundRequests, onApprove, onReject }: RefundRequestsViewProps) {
  const pendingRequests = refundRequests.filter((req: any) => req.status === 'PENDING');
  const processedRequests = refundRequests.filter((req: any) => req.status !== 'PENDING');

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> = {
      PENDING: {
        label: 'Хүлээгдэж байна',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
      },
      APPROVED: {
        label: 'Зөвшөөрөгдсөн',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
      },
      REJECTED: {
        label: 'Татгалзсан',
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
      },
    };

    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}
      >
        <Icon className="w-3 h-3" />
        <span>{statusConfig.label}</span>
      </span>
    );
  };

  if (refundRequests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Буцаалтын хүсэлт байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingRequests.map((request: any) => {
        const sellerItems = request.order.items.filter(
          (item: any) => item.product.seller.id === request.order.items[0]?.product?.seller?.id
        );

        return (
          <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">Буцаалтын хүсэлт #{request.id}</h3>
                  {statusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">Захиалга: #{request.order.id}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Худалдан авагч:{' '}
                  {request.user.profile?.firstName
                    ? `${request.user.profile.firstName} ${request.user.profile.lastName || ''}`
                    : request.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  Огноо: {dayjs(request.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                </p>
                <div className="mt-2">
                  <p className="text-lg font-bold text-orange-600">
                    Буцаах дүн: {formatPrice(request.amount)}₮
                  </p>
                  <p className="text-xs text-gray-500">
                    Захиалгын дүн: {formatPrice(request.order.totalAmount)}₮
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onApprove(request.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Зөвшөөрөх
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Татгалзах
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Захиалгын бүтээгдэхүүн:</h4>
              <div className="space-y-2">
                {sellerItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {item.product.name} x {item.quantity} - {formatPrice(item.price)}₮
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            {request.reason && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Шалтгаан:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Processed Requests */}
      {processedRequests.map((request: any) => {
        const sellerItems = request.order.items.filter(
          (item: any) => item.product.seller.id === request.order.items[0]?.product?.seller?.id
        );

        return (
          <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">Буцаалтын хүсэлт #{request.id}</h3>
                  {statusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">Захиалга: #{request.order.id}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Худалдан авагч:{' '}
                  {request.user.profile?.firstName
                    ? `${request.user.profile.firstName} ${request.user.profile.lastName || ''}`
                    : request.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  Огноо: {dayjs(request.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                </p>
                <div className="mt-2">
                  <p className="text-lg font-bold text-orange-600">
                    Буцаах дүн: {formatPrice(request.amount)}₮
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Захиалгын бүтээгдэхүүн:</h4>
              <div className="space-y-2">
                {sellerItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {item.product.name} x {item.quantity} - {formatPrice(item.price)}₮
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            {request.reason && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Шалтгаан:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RefundRequestsView;
