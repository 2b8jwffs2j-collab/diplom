import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAuthenticated } from '../lib/auth';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import CartItemCard from '../components/cart/CartItemCard';
import CheckoutForm from '../components/cart/CheckoutForm';
import {
  calculateTotal,
  CartItem,
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from '../lib/cart';
import { CREATE_ORDER, MY_WALLET, PURCHASE_WITH_WALLET } from '../lib/graphql';

type PaymentMethod = 'wallet' | 'bank-transfer';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [purchasing, setPurchasing] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const { data: walletData, refetch: refetchWallet } = useQuery(MY_WALLET, {
    skip: !isAuthenticated(),
  });

  const [purchaseWithWallet] = useMutation(PURCHASE_WITH_WALLET, {
    refetchQueries: [{ query: MY_WALLET }],
  });
  const [createOrder] = useMutation(CREATE_ORDER);

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    if (!isAuthenticated() && paymentMethod === 'wallet') {
      setPaymentMethod('bank-transfer');
    }
  }, [paymentMethod]);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateCartQuantity(productId, quantity);
    setCart(getCart());
  };

  const handleRemove = (productId: number) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const handlePurchase = async () => {
    if (!isAuthenticated()) {
      setShowLoginDialog(true);
      return;
    }

    if (!shippingAddress.trim()) {
      toast.error('Хүргэлтийн хаяг оруулна уу!');
      return;
    }

    if (!phone.trim()) {
      toast.error('Утасны дугаар оруулна уу!');
      return;
    }

    if (cart.length === 0) {
      toast.error('Сагс хоосон байна!');
      return;
    }

    const outOfStockItems = cart.filter((item) => !item.stock || item.stock === 0);
    if (outOfStockItems.length > 0) {
      toast.error(
        `${outOfStockItems.map((i) => i.name).join(', ')} бүтээгдэхүүн нөөцөд байхгүй байна!`
      );
      return;
    }

    setPurchasing(true);

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      if (paymentMethod === 'wallet') {
        const { data } = await purchaseWithWallet({
          variables: {
            input: {
              items,
              shippingAddress,
              phone: phone || undefined,
              notes: notes || undefined,
            },
          },
        });

        if (data.purchaseWithWallet.success) {
          toast.success('Захиалга амжилттай үүслээ!');
          clearCart();
          setCart([]);
          await refetchWallet();
          navigate('/orders');
        } else {
          toast.error(`Алдаа: ${data.purchaseWithWallet.message}`);
        }
      } else {
        await createOrder({
          variables: {
            input: {
              items,
              shippingAddress,
              phone: phone || undefined,
              notes: notes || undefined,
            },
          },
        });

        toast.success(
          'Захиалга үүслээ! Банкны шилжүүлгээр төлбөр хийсний дараа админ баталгаажуулна.'
        );
        clearCart();
        setCart([]);
        navigate('/orders');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(`Алдаа гарлаа: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  const total = calculateTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Таны сагс хоосон байна
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Бүтээгдэхүүн нэмж худалдан авалт хийцгээе!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Бүтээгдэхүүн үзэх
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Сагс</h1>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cart.map((item) => (
            <CartItemCard
              key={item.productId}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Checkout */}
        <div>
          <CheckoutForm
            shippingAddress={shippingAddress}
            phone={phone}
            notes={notes}
            paymentMethod={paymentMethod}
            total={total}
            walletBalance={walletData?.myWallet?.balance || '0'}
            isAuthenticated={isAuthenticated()}
            purchasing={purchasing}
            onShippingAddressChange={setShippingAddress}
            onPhoneChange={setPhone}
            onNotesChange={setNotes}
            onPaymentMethodChange={setPaymentMethod}
            onPurchase={handlePurchase}
            onShowLoginDialog={() => setShowLoginDialog(true)}
          />
        </div>
      </div>

      {/* Login Confirm Dialog */}
      <ConfirmDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Нэвтэрч орох шаардлагатай"
        description="Худалдан авалт хийх эсвэл Wallet ашиглахын тулд нэвтэрч орох шаардлагатай. Нэвтрэх хуудас руу шилжих үү?"
        confirmLabel="Тийм, нэвтрэх"
        cancelLabel="Цуцлах"
        onConfirm={() => {
          setShowLoginDialog(false);
          navigate('/login');
        }}
      />
    </div>
  );
}

export default Cart;
