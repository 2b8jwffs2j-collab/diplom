import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { formatPrice } from '../../lib/cart';

interface Transaction {
  id: number;
  amount: string;
  type: string;
  description?: string;
  createdAt: string;
  wallet?: {
    user?: {
      profile?: {
        firstName?: string;
      };
      email?: string;
    };
  };
}

interface AdminTransactionsTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

function AdminTransactionsTable({ transactions, loading }: AdminTransactionsTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Гүйлгээний мэдээлэл ачаалж байна...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">Гүйлгээ олдсонгүй</p>
        <p className="text-gray-500 text-sm mt-2">Одоогоор гүйлгээний түүх байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Хэрэглэгч
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дүн
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Төрөл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Тайлбар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Огноо
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {tx.wallet?.user?.profile?.firstName || tx.wallet?.user?.email || '-'}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    parseInt(tx.amount) > 0 ? 'text-blue-600' : 'text-blue-700'
                  }`}
                >
                  {parseInt(tx.amount) > 0 ? '+' : ''}
                  {formatPrice(tx.amount)}₮
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{tx.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dayjs(tx.createdAt).locale('mn').format('YYYY-MM-DD')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTransactionsTable;
