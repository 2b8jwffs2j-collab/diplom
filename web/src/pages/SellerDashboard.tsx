import { useMutation, useQuery } from '@apollo/client';
import { ClipboardList, Package, Plus, Store, User, Wallet as WalletIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import ApproveStockRequestDialog from '../components/seller/ApproveStockRequestDialog';
import EarningsView from '../components/seller/EarningsView';
import OrderList from '../components/seller/OrderList';
import ProductForm from '../components/seller/ProductForm';
import ProductList from '../components/seller/ProductList';
import ProfileView from '../components/seller/ProfileView';
import RefundRequestsView from '../components/seller/RefundRequestsView';
import StockRequestsView from '../components/seller/StockRequestsView';
import { isAuthenticated } from '../lib/auth';
import {
  APPROVE_REFUND_REQUEST,
  APPROVE_STOCK_REQUEST,
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  GET_CATEGORIES,
  GET_PRODUCTS,
  ME,
  MY_SELLER_ORDERS,
  REJECT_REFUND_REQUEST,
  REJECT_STOCK_REQUEST,
  SELLER_REFUND_REQUESTS,
  SELLER_STOCK_REQUESTS,
  UPDATE_ORDER_STATUS,
  UPDATE_PRODUCT,
} from '../lib/graphql';

type TabType = 'products' | 'orders' | 'earnings' | 'profile' | 'stockRequests' | 'refundRequests';

function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    categoryId: '',
    imageUrls: [] as string[],
    materials: '',
    timeToMake: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [approveStockRequestDialog, setApproveStockRequestDialog] = useState<{
    open: boolean;
    requestId: number | null;
    expectedDate: string;
  }>({
    open: false,
    requestId: null,
    expectedDate: '',
  });

  const [deleteProductDialog, setDeleteProductDialog] = useState<{
    open: boolean;
    productId: number | null;
  }>({
    open: false,
    productId: null,
  });

  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    orderId: number | null;
    newStatus: string;
  }>({
    open: false,
    orderId: null,
    newStatus: '',
  });

  const [rejectStockRequestDialog, setRejectStockRequestDialog] = useState<{
    open: boolean;
    requestId: number | null;
  }>({
    open: false,
    requestId: null,
  });

  const { data: meData, loading: meLoading } = useQuery(ME, {
    skip: !isAuthenticated(),
    fetchPolicy: 'network-only',
  });
  const { data: productsData, refetch: refetchProducts } = useQuery(GET_PRODUCTS, {
    variables: { sellerId: meData?.me?.id },
    skip: !meData?.me?.id || activeTab !== 'products',
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: ordersData, refetch: refetchOrders } = useQuery(MY_SELLER_ORDERS, {
    skip: !isAuthenticated() || (activeTab !== 'orders' && activeTab !== 'earnings'),
  });

  const { data: stockRequestsData, refetch: refetchStockRequests } = useQuery(
    SELLER_STOCK_REQUESTS,
    {
      skip: !isAuthenticated() || activeTab !== 'stockRequests',
    }
  );

  const { data: refundRequestsData } = useQuery(SELLER_REFUND_REQUESTS, {
    skip: !isAuthenticated() || activeTab !== 'refundRequests',
  });

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Бүтээгдэхүүн амжилттай нэмэгдлээ! Админ зөвшөөрөх хүртэл хүлээнэ үү.');
      setShowCreateForm(false);
      resetForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Бүтээгдэхүүн шинэчлэгдлээ!');
      setEditingProduct(null);
      resetForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
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

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      toast.success('Захиалгын статус шинэчлэгдлээ!');
      refetchOrders();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
    refetchQueries: [{ query: MY_SELLER_ORDERS }],
  });

  const [approveStockRequest] = useMutation(APPROVE_STOCK_REQUEST, {
    onCompleted: () => {
      toast.success('Хүсэлт зөвшөөрөгдлөө!');
      refetchStockRequests();
      setApproveStockRequestDialog({
        open: false,
        requestId: null,
        expectedDate: '',
      });
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [rejectStockRequest] = useMutation(REJECT_STOCK_REQUEST, {
    onCompleted: () => {
      toast.success('Хүсэлт татгалзлаа!');
      refetchStockRequests();
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [approveRefundRequest] = useMutation(APPROVE_REFUND_REQUEST, {
    onCompleted: () => {
      toast.success('Буцаалтын хүсэлт зөвшөөрөгдлөө!');
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
    refetchQueries: [{ query: SELLER_REFUND_REQUESTS }],
  });

  const [rejectRefundRequest] = useMutation(REJECT_REFUND_REQUEST, {
    onCompleted: () => {
      toast.success('Буцаалтын хүсэлт татгалзлаа!');
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
    refetchQueries: [{ query: SELLER_REFUND_REQUESTS }],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      categoryId: '',
      imageUrls: [],
      materials: '',
      timeToMake: '',
    });
  };

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

  if (meLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (meData?.me?.role !== 'SELLER' && meData?.me?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Зөвхөн худалдагчид нэвтрэх боломжтой
        </h1>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
        >
          Нүүр хуудас руу буцах
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Заавал бөглөх талбаруудыг бөглөнө үү!');
      return;
    }

    // Discount байвал originalPrice-ийг тооцоолно
    const calculatedOriginalPrice =
      formData.discount && parseFloat(formData.discount) > 0
        ? parseFloat(formData.price) / (1 - parseFloat(formData.discount) / 100)
        : undefined;

    const input = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      originalPrice: calculatedOriginalPrice,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      stock: parseInt(formData.stock),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
      materials: formData.materials || undefined,
      timeToMake: formData.timeToMake || undefined,
    };

    if (editingProduct) {
      await updateProduct({
        variables: {
          id: editingProduct.id,
          input,
        },
      });
    } else {
      await createProduct({
        variables: { input },
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    let imageUrls: string[] = [];
    if (product.imageUrls) {
      if (typeof product.imageUrls === 'string') {
        try {
          imageUrls = JSON.parse(product.imageUrls);
        } catch {
          imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
        }
      } else if (Array.isArray(product.imageUrls)) {
        imageUrls = product.imageUrls;
      }
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      price: (parseInt(product.price) / 100).toString(),
      discount: product.discount?.toString() || '',
      stock: product.stock.toString(),
      categoryId: product.categoryId?.toString() || '',
      imageUrls,
      materials: product.materials || '',
      timeToMake: product.timeToMake || '',
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    setDeleteProductDialog({
      open: true,
      productId: id,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteProductDialog.productId) {
      deleteProduct({ variables: { id: deleteProductDialog.productId } });
      setDeleteProductDialog({ open: false, productId: null });
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setStatusChangeDialog({
      open: true,
      orderId,
      newStatus,
    });
  };

  const handleStatusChangeConfirm = () => {
    if (statusChangeDialog.orderId && statusChangeDialog.newStatus) {
      updateOrderStatus({
        variables: {
          id: statusChangeDialog.orderId,
          status: statusChangeDialog.newStatus,
        },
      });
      setStatusChangeDialog({ open: false, orderId: null, newStatus: '' });
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      APPROVED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
      REJECTED: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700',
    };
    const labels: Record<string, string> = {
      PENDING: 'Хүлээгдэж байна',
      APPROVED: 'Зөвшөөрөгдсөн',
      REJECTED: 'Татгалзсан',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const orderStatusBadge = (status: string) => {
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
      SHIPPED: 'Хүргэгдсэн',
      DELIVERED: 'Хүлээн авсан',
      CANCELLED: 'Цуцлагдсан',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const calculateEarnings = () => {
    if (!ordersData?.mySellerOrders) return { total: 0, thisMonth: 0, count: 0, commission: 0 };

    const orders = ordersData.mySellerOrders;
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let total = 0;
    let thisMonthTotal = 0;
    let count = 0;

    orders.forEach((order: any) => {
      if (order.status === 'DELIVERED') {
        const orderDate = new Date(order.createdAt);
        const sellerItems = order.items.filter(
          (item: any) => item.product.seller.id === meData?.me?.id
        );
        const sellerTotal = sellerItems.reduce(
          (sum: number, item: any) => sum + parseInt(item.price) * item.quantity,
          0
        );

        const sellerEarning = (sellerTotal * 95) / 100;

        total += sellerEarning;
        count += 1;

        if (orderDate >= thisMonth) {
          thisMonthTotal += sellerEarning;
        }
      }
    });

    const commission = (total * 5) / 95;

    return { total, thisMonth: thisMonthTotal, count, commission };
  };

  const earnings = calculateEarnings();

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'products', label: 'Бүтээгдэхүүн', icon: Package },
    { id: 'orders', label: 'Захиалга', icon: ClipboardList },
    { id: 'earnings', label: 'Орлого', icon: WalletIcon },
    { id: 'stockRequests', label: 'Хүсэлтүүд', icon: ClipboardList },
    { id: 'refundRequests', label: 'Буцаалт', icon: ClipboardList },
    { id: 'profile', label: 'Профайл', icon: User },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Худалдагчийн самбар</h1>
          </div>
          <BackButton />
        </div>
        <p className="text-sm sm:text-base text-gray-600">Бүтээгдэхүүн, захиалга, орлого удирдах</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowCreateForm(false);
                setEditingProduct(null);
                resetForm();
              }}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Миний бүтээгдэхүүнүүд</h2>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                if (showCreateForm) {
                  setEditingProduct(null);
                  resetForm();
                }
              }}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {showCreateForm ? (
                'Хаах'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Бүтээгдэхүүн нэмэх</span>
                </>
              )}
            </button>
          </div>

          {showCreateForm && (
            <ProductForm
              formData={formData}
              editingProduct={editingProduct}
              categories={categoriesData?.categories || []}
              creating={creating}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditingProduct(null);
                resetForm();
                setShowCreateForm(false);
              }}
            />
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ProductList
              products={productsData?.products || []}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              statusBadge={statusBadge}
            />
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Захиалга</h2>
          <OrderList
            orders={ordersData?.mySellerOrders || []}
            sellerId={meData?.me?.id}
            onStatusChange={handleStatusChange}
            orderStatusBadge={orderStatusBadge}
          />
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && <EarningsView earnings={earnings} />}

      {/* Stock Requests Tab */}
      {activeTab === 'stockRequests' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Урдчилан захиалах хүсэлтүүд</h2>
          <StockRequestsView
            stockRequests={stockRequestsData?.sellerStockRequests || []}
            onApproveClick={(requestId) =>
              setApproveStockRequestDialog({
                open: true,
                requestId,
                expectedDate: '',
              })
            }
            onReject={(id) =>
              setRejectStockRequestDialog({
                open: true,
                requestId: id,
              })
            }
          />
        </div>
      )}

      {/* Refund Requests Tab */}
      {activeTab === 'refundRequests' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Буцаалтын хүсэлтүүд</h2>
          <RefundRequestsView
            refundRequests={refundRequestsData?.sellerRefundRequests || []}
            onApprove={(id) => approveRefundRequest({ variables: { id } })}
            onReject={(id) => rejectRefundRequest({ variables: { id } })}
          />
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && <ProfileView meData={meData} />}

      {/* Approve Stock Request Dialog */}
      <ApproveStockRequestDialog
        open={approveStockRequestDialog.open}
        requestId={approveStockRequestDialog.requestId}
        expectedDate={approveStockRequestDialog.expectedDate}
        onExpectedDateChange={(date) =>
          setApproveStockRequestDialog({ ...approveStockRequestDialog, expectedDate: date })
        }
        onApprove={(requestId, expectedDate) => {
          approveStockRequest({
            variables: {
              id: requestId,
              expectedCompletionDate: expectedDate,
            },
          });
        }}
        onClose={() =>
          setApproveStockRequestDialog({
            open: false,
            requestId: null,
            expectedDate: '',
          })
        }
      />

      {/* Delete Product Dialog */}
      <ConfirmDialog
        open={deleteProductDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteProductDialog({ open: false, productId: null });
          }
        }}
        title="Бүтээгдэхүүн устгах"
        description="Энэ бүтээгдэхүүнийг устгах уу? Энэ үйлдлийг буцаах боломжгүй!"
        confirmLabel="Устгах"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />

      {/* Status Change Dialog */}
      <ConfirmDialog
        open={statusChangeDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setStatusChangeDialog({ open: false, orderId: null, newStatus: '' });
          }
        }}
        title="Захиалгын статус солих"
        description={`Захиалгын статусыг "${statusChangeDialog.newStatus}" болгох уу?`}
        confirmLabel="Тийм"
        onConfirm={handleStatusChangeConfirm}
      />

      {/* Reject Stock Request Dialog */}
      <ConfirmDialog
        open={rejectStockRequestDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRejectStockRequestDialog({ open: false, requestId: null });
          }
        }}
        title="Хүсэлт татгалзах"
        description="Энэ хүсэлтийг татгалзах уу?"
        confirmLabel="Татгалзах"
        onConfirm={() => {
          if (rejectStockRequestDialog.requestId) {
            rejectStockRequest({ variables: { id: rejectStockRequestDialog.requestId } });
            setRejectStockRequestDialog({ open: false, requestId: null });
          }
        }}
        variant="danger"
      />
    </div>
  );
}

export default SellerDashboard;
