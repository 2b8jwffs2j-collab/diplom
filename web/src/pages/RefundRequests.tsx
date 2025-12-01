import { useQuery } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { RotateCcw, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { MY_REFUND_REQUESTS } from '../lib/graphql';
import { formatPrice } from '../lib/cart';
import { isAuthenticated } from '../lib/auth';
import BackButton from '../components/BackButton';

function RefundRequests() {
  const navigate = useNavigate();
  const { data, loading } = useQuery(MY_REFUND_REQUESTS, {
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

  const requests = data?.myRefundRequests || [];

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> = {
      PENDING: {
        label: 'Хүлээгдэж байна',
        icon: Clock,
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
      APPROVED: {
        label: 'Зөвшөөрөгдсөн',
        icon: CheckCircle,
        color: 'bg-green-50 text-green-700 border-green-200',
      },
      REJECTED: {
        label: 'Татгалзсан',
        icon: XCircle,
        color: 'bg-red-50 text-red-700 border-red-200',
      },
    };

    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
      >
        <Icon className="w-4 h-4" />
        <span>{statusConfig.label}</span>
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <RotateCcw className="w-10 h-10 text-orange-600" />
          <h1 className="text-4xl font-bold">Миний буцаалтын хүсэлтүүд</h1>
        </div>
        <BackButton />
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-6">Буцаалтын хүсэлт байхгүй байна</p>
          <Link
            to="/orders"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Захиалга руу буцах
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request: any) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Буцаалтын хүсэлт #{request.id}
                    </h3>
                    {statusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Захиалга: #{request.order.id}</p>
                  <p className="text-sm text-gray-600">
                    Огноо: {dayjs(request.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(request.amount)}₮
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Захиалгын дүн: {formatPrice(request.order.totalAmount)}₮
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t pt-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Захиалгын бүтээгдэхүүн:</h4>
                <div className="space-y-2">
                  {request.order.items.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3 text-sm">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {item.product.name} x {item.quantity}
                      </span>
                    </div>
                  ))}
                  {request.order.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      + {request.order.items.length - 3} бусад бүтээгдэхүүн
                    </p>
                  )}
                </div>
              </div>

              {/* Reason */}
              {request.reason && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Шалтгаан:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex items-center justify-between">
                <Link
                  to={`/orders/${request.order.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Захиалга дэлгэрэнгүй →
                </Link>
                {request.status === 'APPROVED' && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Wallet-д мөнгө нэмэгдсэн
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RefundRequests;
