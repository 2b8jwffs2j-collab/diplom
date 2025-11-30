import { Trash } from 'lucide-react';
import { formatPrice } from '../../lib/cart';

interface User {
  id: number;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  wallet?: {
    balance: string;
  };
}

interface AdminUsersTableProps {
  users: User[];
  userRoleFilter: 'BUYER' | 'SELLER' | 'ADMIN' | undefined;
  onRoleFilterChange: (role: 'BUYER' | 'SELLER' | 'ADMIN' | undefined) => void;
  onRoleChange: (userId: number, newRole: 'BUYER' | 'SELLER' | 'ADMIN', userEmail: string) => void;
  onDeleteUser: (userId: number, userEmail: string) => void;
}

function AdminUsersTable({
  users,
  userRoleFilter,
  onRoleFilterChange,
  onRoleChange,
  onDeleteUser,
}: AdminUsersTableProps) {
  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <label className="text-sm font-medium text-gray-700">Эрхээр шүүх:</label>
        <select
          value={userRoleFilter || 'ALL'}
          onChange={(e) =>
            onRoleFilterChange(e.target.value === 'ALL' ? undefined : (e.target.value as any))
          }
          className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="ALL">Бүгд</option>
          <option value="BUYER">Худалдан авагч</option>
          <option value="SELLER">Худалдагч</option>
          <option value="ADMIN">Админ</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  И-мэйл
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Нэр
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Эрх
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Баланс
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {user.profile?.firstName || '-'} {user.profile?.lastName || ''}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as 'BUYER' | 'SELLER' | 'ADMIN';
                        if (newRole !== user.role) {
                          onRoleChange(user.id, newRole, user.email);
                        }
                      }}
                      className="text-xs sm:text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="BUYER">BUYER</option>
                      <option value="SELLER">SELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-2xl border border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm">
                      {formatPrice(user.wallet?.balance || '0')}₮
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm space-x-2">
                    <button
                      onClick={() => onDeleteUser(user.id, user.email)}
                      className="text-white flex px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium text-xs sm:text-sm"
                    >
                      <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Устгах</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsersTable;
