import { formatPrice } from '../../lib/cart';

interface EarningsViewProps {
  earnings: {
    total: number;
    thisMonth: number;
    count: number;
    commission: number;
  };
}

function EarningsView({ earnings }: EarningsViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Орлого ба статистик</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-700">
            {formatPrice(earnings.total.toString())}₮
          </div>
          <div className="text-sm text-blue-600 mt-1">Нийт орлого (95%)</div>
          <p className="text-xs text-gray-500 mt-2">* 5% комисс системд үлдсэн</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-700">
            {formatPrice(earnings.thisMonth.toString())}₮
          </div>
          <div className="text-sm text-blue-600 mt-1">Энэ сарын орлого</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-700">{earnings.count}</div>
          <div className="text-sm text-blue-600 mt-1">Хүлээн авсан захиалга</div>
        </div>
      </div>
    </div>
  );
}

export default EarningsView;
