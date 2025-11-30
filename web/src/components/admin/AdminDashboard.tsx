import { formatPrice } from '../../lib/cart';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingProducts: number;
  totalRevenue: string;
  todayTopUps: string;
  systemCommission: string;
  totalCommissionEarned: string;
}

interface AdminDashboardProps {
  stats: AdminStats | null;
}

function AdminDashboard({ stats }: AdminDashboardProps) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.totalUsers}</div>
          <div className="text-xs sm:text-sm text-blue-600 mt-1">Нийт хэрэглэгч</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.totalProducts}</div>
          <div className="text-xs sm:text-sm text-blue-600 mt-1">Нийт бүтээгдэхүүн</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.totalOrders}</div>
          <div className="text-xs sm:text-sm text-blue-600 mt-1">Нийт захиалга</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">
            {stats.pendingProducts}
          </div>
          <div className="text-xs sm:text-sm text-blue-600 mt-1">Хүлээгдэж буй</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Нийт орлого</h3>
          <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}₮</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Өнөөдрийн топ-ап</h3>
          <div className="text-2xl font-bold text-gray-900">{formatPrice(stats.todayTopUps)}₮</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Системийн комисс (5%)</h3>
          <div className="text-2xl font-bold text-green-700">
            {formatPrice(stats.systemCommission)}₮
          </div>
          <p className="text-xs text-green-600 mt-1">Нийт борлуулалтын 5%</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Хүргэгдсэн захиалгын комисс</h3>
          <div className="text-2xl font-bold text-blue-700">
            {formatPrice(stats.totalCommissionEarned)}₮
          </div>
          <p className="text-xs text-blue-600 mt-1">Хүргэгдсэн захиалгын 5%</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
