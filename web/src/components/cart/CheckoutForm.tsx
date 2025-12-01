import { Building2, Wallet as WalletIcon } from 'lucide-react';
import { formatPrice } from '../../lib/cart';

type PaymentMethod = 'wallet' | 'bank-transfer';

interface CheckoutFormProps {
  shippingAddress: string;
  phone: string;
  notes: string;
  paymentMethod: PaymentMethod;
  total: number;
  walletBalance: string;
  isAuthenticated: boolean;
  purchasing: boolean;
  onShippingAddressChange: (address: string) => void;
  onPhoneChange: (phone: string) => void;
  onNotesChange: (notes: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onPurchase: () => void;
  onShowLoginDialog: () => void;
}

function CheckoutForm({
  shippingAddress,
  phone,
  notes,
  paymentMethod,
  total,
  walletBalance,
  isAuthenticated,
  purchasing,
  onShippingAddressChange,
  onPhoneChange,
  onNotesChange,
  onPaymentMethodChange,
  onPurchase,
  onShowLoginDialog,
}: CheckoutFormProps) {
  const canPurchaseWithWallet =
    isAuthenticated && paymentMethod === 'wallet' && total <= parseInt(walletBalance || '0');

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Захиалга баталгаажуулах</h2>

      {/* Shipping Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Хүргэлтийн хаяг *</label>
        <textarea
          value={shippingAddress}
          onChange={(e) => onShippingAddressChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          rows={3}
          placeholder="Улаанбаатар, СБД, 1-р хороо..."
        />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар *</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          placeholder="99112233"
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Тэмдэглэл (сонголт)</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          rows={2}
          placeholder="Нэмэлт мэдээлэл..."
        />
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Төлбөрийн арга</label>
        <div className="space-y-2">
          {isAuthenticated ? (
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 font-medium">
                  <WalletIcon className="w-4 h-4" />
                  <span>Wallet</span>
                </div>
                <div className="text-xs text-gray-600">
                  Баланс: {formatPrice(walletBalance || '0')}₮
                </div>
              </div>
            </label>
          ) : (
            <label
              className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 opacity-60"
              onClick={onShowLoginDialog}
            >
              <input type="radio" name="payment" value="wallet" disabled className="mr-3" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 font-medium">
                  <WalletIcon className="w-4 h-4" />
                  <span>Wallet</span>
                </div>
                <div className="text-xs text-gray-600">Нэвтэрч орох шаардлагатай</div>
              </div>
            </label>
          )}
          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="bank-transfer"
              checked={paymentMethod === 'bank-transfer'}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 font-medium">
                <Building2 className="w-4 h-4" />
                <span>Банкны шилжүүлгэ</span>
              </div>
              <div className="text-xs text-gray-600">Төлбөр хийсний дараа админ баталгаажуулна</div>
            </div>
          </label>
        </div>
      </div>

      {/* Bank Transfer Info */}
      {paymentMethod === 'bank-transfer' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Банкны мэдээлэл:</p>
          <p className="text-sm text-blue-800">
            Данс: <strong>1234567890</strong>
          </p>
          <p className="text-sm text-blue-800">
            Банк: <strong>Хаан банк</strong>
          </p>
          <p className="text-sm text-blue-800">
            Хүлээн авагч: <strong>Гар урлал ХХК</strong>
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Төлбөрийн улсын дугаарыг захиалгын дугаар болгон ашиглана уу
          </p>
        </div>
      )}

      {/* Total */}
      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between text-base sm:text-lg font-semibold mb-2">
          <span>Нийт:</span>
          <span className="text-blue-600">{formatPrice(total)}₮</span>
        </div>
        {paymentMethod === 'wallet' && (
          <p className="text-xs sm:text-sm text-gray-600">Wallet-аас төлнө</p>
        )}
        {paymentMethod === 'bank-transfer' && (
          <p className="text-xs sm:text-sm text-gray-600">Банкны шилжүүлгээр төлнө</p>
        )}
      </div>

      {/* Purchase Button */}
      <button
        onClick={onPurchase}
        disabled={
          purchasing ||
          (!isAuthenticated && paymentMethod === 'wallet') ||
          (isAuthenticated && paymentMethod === 'wallet' && !canPurchaseWithWallet)
        }
        className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {purchasing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Уншиж байна...
          </span>
        ) : paymentMethod === 'wallet' ? (
          <span className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5" />
            Wallet-аар төлөх
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Банкны шилжүүлгээр захиалах
          </span>
        )}
      </button>

      {!isAuthenticated && paymentMethod === 'wallet' && (
        <p className="text-sm text-blue-700 mt-2 text-center">
          Wallet ашиглахын тулд нэвтэрч орох шаардлагатай
        </p>
      )}

      {isAuthenticated && paymentMethod === 'wallet' && !canPurchaseWithWallet && (
        <p className="text-sm text-blue-700 mt-2 text-center">
          Wallet баланс хүрэлцэхгүй байна. Wallet цэнэглэх эсвэл банкны шилжүүлгэ сонгоно уу.
        </p>
      )}
    </div>
  );
}

export default CheckoutForm;
