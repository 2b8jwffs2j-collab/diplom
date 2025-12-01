import dayjs from 'dayjs';
import 'dayjs/locale/mn';

interface StockRequestsViewProps {
  stockRequests: any[];
  onApproveClick: (requestId: number) => void;
  onReject: (id: number) => void;
}

function StockRequestsView({ stockRequests, onApproveClick, onReject }: StockRequestsViewProps) {
  const pendingRequests = stockRequests.filter((req: any) => req.status === 'PENDING');
  const processedRequests = stockRequests.filter((req: any) => req.status !== 'PENDING');

  if (stockRequests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-600">Хүсэлт байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingRequests.map((request: any) => (
        <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-semibold text-gray-900">{request.product.name}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  Хүлээгдэж байна
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Худалдан авагч: {request.user.profile?.firstName || request.user.email}
              </p>
              <p className="text-sm text-gray-600">Тоо ширхэг: {request.quantity}</p>
              <p className="text-sm text-gray-600">
                Хүсэлт илгээсэн: {dayjs(request.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onApproveClick(request.id)}
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
        </div>
      ))}

      {/* Approved/Rejected Requests */}
      {processedRequests.map((request: any) => (
        <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-semibold text-gray-900">{request.product.name}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {request.status === 'APPROVED' ? 'Зөвшөөрөгдсөн' : 'Татгалзсан'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Худалдан авагч: {request.user.profile?.firstName || request.user.email}
              </p>
              <p className="text-sm text-gray-600">Тоо ширхэг: {request.quantity}</p>
              {request.expectedCompletionDate && (
                <p className="text-sm text-gray-600">
                  Дуусах цаг:{' '}
                  {dayjs(request.expectedCompletionDate).locale('mn').format('YYYY-MM-DD HH:mm')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StockRequestsView;
