import { useMutation, useQuery } from '@apollo/client';
import { BarChart3, Package, Settings, Users, Wallet as WalletIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProductsView from '../components/admin/AdminProductsView';
import AdminTransactionsTable from '../components/admin/AdminTransactionsTable';
import AdminUsersTable from '../components/admin/AdminUsersTable';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import { isAuthenticated } from '../lib/auth';
import {
  ADMIN_STATS,
  ALL_TRANSACTIONS,
  ALL_USERS,
  APPROVE_PRODUCT,
  DELETE_PRODUCT,
  DELETE_USER,
  GET_PRODUCTS,
  ME,
  REJECT_PRODUCT,
  UPDATE_USER_ROLE,
} from '../lib/graphql';

type TabType = 'dashboard' | 'users' | 'products' | 'transactions';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>(
    'PENDING'
  );
  const [userRoleFilter, setUserRoleFilter] = useState<'BUYER' | 'SELLER' | 'ADMIN' | undefined>(
    undefined
  );

  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    open: boolean;
    userId: number | null;
    newRole: 'BUYER' | 'SELLER' | 'ADMIN' | null;
    userEmail: string;
  }>({
    open: false,
    userId: null,
    newRole: null,
    userEmail: '',
  });

  const [deleteUserDialog, setDeleteUserDialog] = useState<{
    open: boolean;
    userId: number | null;
    userEmail: string;
  }>({
    open: false,
    userId: null,
    userEmail: '',
  });

  const [deleteProductDialog, setDeleteProductDialog] = useState<{
    open: boolean;
    productId: number | null;
    productName: string;
  }>({
    open: false,
    productId: null,
    productName: '',
  });

  const [rejectProductDialog, setRejectProductDialog] = useState<{
    open: boolean;
    productId: number | null;
    productName: string;
  }>({
    open: false,
    productId: null,
    productName: '',
  });

  const [approveProductDialog, setApproveProductDialog] = useState<{
    open: boolean;
    productId: number | null;
  }>({
    open: false,
    productId: null,
  });

  const { data: meData, loading: meLoading } = useQuery(ME, {
    skip: !isAuthenticated(),
    fetchPolicy: 'network-only',
  });

  const { data: statsData } = useQuery(ADMIN_STATS, {
    skip: !isAuthenticated() || activeTab !== 'dashboard',
  });

  const { data: usersData, refetch: refetchUsers } = useQuery(ALL_USERS, {
    variables: { role: userRoleFilter },
    skip: !isAuthenticated() || activeTab !== 'users',
  });

  const { data: transactionsData, loading: transactionsLoading } = useQuery(ALL_TRANSACTIONS, {
    variables: { limit: 50 },
    skip: !isAuthenticated() || activeTab !== 'transactions',
  });

  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useQuery(GET_PRODUCTS, {
    variables: { status: statusFilter === 'ALL' ? undefined : statusFilter },
    skip: !isAuthenticated() || activeTab !== 'products',
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      toast.success('Бүтээгдэхүүн устгагдлаа!');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [approveProduct] = useMutation(APPROVE_PRODUCT, {
    onCompleted: () => {
      toast.success('✓ Бүтээгдэхүүн зөвшөөрөгдлөө!');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [rejectProduct] = useMutation(REJECT_PRODUCT, {
    onCompleted: () => {
      toast.success('Бүтээгдэхүүн татгалзсан!');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => {
      toast.success('Хэрэглэгчийн эрх шинэчлэгдлээ!');
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success('Хэрэглэгч устгагдлаа!');
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  if (meLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (meData?.me?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Эрх хүрэхгүй</h2>
          <p className="text-gray-600 mb-6">Зөвхөн админ энэ хуудсыг харах боломжтой.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Нүүр хуудас руу буцах
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteProductClick = (id: number, productName: string) => {
    setDeleteProductDialog({
      open: true,
      productId: id,
      productName,
    });
  };

  const handleDeleteProductConfirm = () => {
    if (deleteProductDialog.productId) {
      deleteProduct({ variables: { id: deleteProductDialog.productId } });
      setDeleteProductDialog({ open: false, productId: null, productName: '' });
    }
  };

  const handleApprove = (id: number) => {
    setApproveProductDialog({
      open: true,
      productId: id,
    });
  };

  const handleApproveConfirm = () => {
    if (approveProductDialog.productId) {
      approveProduct({ variables: { id: approveProductDialog.productId } });
      setApproveProductDialog({ open: false, productId: null });
    }
  };

  const handleRejectClick = (id: number, productName: string) => {
    setRejectProductDialog({
      open: true,
      productId: id,
      productName,
    });
  };

  const handleRejectConfirm = () => {
    if (rejectProductDialog.productId) {
      rejectProduct({ variables: { id: rejectProductDialog.productId } });
      setRejectProductDialog({ open: false, productId: null, productName: '' });
    }
  };

  const handleRoleChangeClick = (
    userId: number,
    newRole: 'BUYER' | 'SELLER' | 'ADMIN',
    userEmail: string
  ) => {
    setRoleChangeDialog({
      open: true,
      userId,
      newRole,
      userEmail,
    });
  };

  const handleRoleChangeConfirm = () => {
    if (roleChangeDialog.userId && roleChangeDialog.newRole) {
      updateUserRole({
        variables: { id: roleChangeDialog.userId, role: roleChangeDialog.newRole },
      });
      setRoleChangeDialog({ open: false, userId: null, newRole: null, userEmail: '' });
    }
  };

  const handleDeleteUserClick = (userId: number, userEmail: string) => {
    setDeleteUserDialog({
      open: true,
      userId,
      userEmail,
    });
  };

  const handleDeleteUserConfirm = () => {
    if (deleteUserDialog.userId) {
      deleteUser({ variables: { id: deleteUserDialog.userId } });
      setDeleteUserDialog({ open: false, userId: null, userEmail: '' });
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Дашбоард', icon: BarChart3 },
    { id: 'users', label: 'Хэрэглэгчид', icon: Users },
    { id: 'products', label: 'Бүтээгдэхүүн', icon: Package },
    { id: 'transactions', label: 'Гүйлгээ', icon: WalletIcon },
  ];

  const getRoleLabel = (role: 'ADMIN' | 'SELLER' | 'BUYER' | null) => {
    if (role === 'ADMIN') return 'Админ';
    if (role === 'SELLER') return 'Худалдагч';
    if (role === 'BUYER') return 'Худалдан авагч';
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Админ самбар</h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600">Системийн удирдлага</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <AdminDashboard stats={statsData?.adminStats || null} />}

      {activeTab === 'users' && (
        <AdminUsersTable
          users={usersData?.allUsers || []}
          userRoleFilter={userRoleFilter}
          onRoleFilterChange={setUserRoleFilter}
          onRoleChange={handleRoleChangeClick}
          onDeleteUser={handleDeleteUserClick}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsView
          products={productsData?.products || []}
          loading={productsLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onApprove={handleApprove}
          onReject={handleRejectClick}
          onDelete={handleDeleteProductClick}
        />
      )}

      {activeTab === 'transactions' && (
        <AdminTransactionsTable
          transactions={transactionsData?.allTransactions || []}
          loading={transactionsLoading}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={roleChangeDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRoleChangeDialog({ open: false, userId: null, newRole: null, userEmail: '' });
          }
        }}
        title="Эрх солих"
        description={
          <>
            <span className="font-semibold">{roleChangeDialog.userEmail}</span> хэрэглэгчийн эрхийг{' '}
            <span className="font-semibold text-blue-600">
              {getRoleLabel(roleChangeDialog.newRole)}
            </span>{' '}
            болгох уу?
          </>
        }
        onConfirm={handleRoleChangeConfirm}
      />

      <ConfirmDialog
        open={deleteUserDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUserDialog({ open: false, userId: null, userEmail: '' });
          }
        }}
        title="Хэрэглэгч устгах"
        description={
          <>
            <span className="font-semibold text-blue-700">
              &quot;{deleteUserDialog.userEmail}&quot;
            </span>{' '}
            хэрэглэгчийг устгах уу? Энэ үйлдлийг буцаах боломжгүй!
          </>
        }
        confirmLabel="Устгах"
        onConfirm={handleDeleteUserConfirm}
        variant="danger"
      />

      <ConfirmDialog
        open={deleteProductDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteProductDialog({ open: false, productId: null, productName: '' });
          }
        }}
        title="Бүтээгдэхүүн устгах"
        description={
          <>
            <span className="font-semibold text-blue-700">
              &quot;{deleteProductDialog.productName}&quot;
            </span>{' '}
            бүтээгдэхүүнийг устгах уу? Энэ үйлдлийг буцаах боломжгүй!
          </>
        }
        confirmLabel="Устгах"
        onConfirm={handleDeleteProductConfirm}
        variant="danger"
      />

      <ConfirmDialog
        open={rejectProductDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRejectProductDialog({ open: false, productId: null, productName: '' });
          }
        }}
        title="Бүтээгдэхүүн татгалзах"
        description={
          <>
            <span className="font-semibold text-blue-700">
              &quot;{rejectProductDialog.productName}&quot;
            </span>{' '}
            бүтээгдэхүүнийг татгалзах уу?
          </>
        }
        confirmLabel="Татгалзах"
        onConfirm={handleRejectConfirm}
        variant="danger"
      />

      <ConfirmDialog
        open={approveProductDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setApproveProductDialog({ open: false, productId: null });
          }
        }}
        title="Бүтээгдэхүүн зөвшөөрөх"
        description="Энэ бүтээгдэхүүнийг зөвшөөрөх үү?"
        confirmLabel="Зөвшөөрөх"
        onConfirm={handleApproveConfirm}
      />
    </div>
  );
}

export default AdminPanel;
