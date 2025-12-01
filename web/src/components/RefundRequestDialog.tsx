import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { CREATE_REFUND_REQUEST } from '../lib/graphql';
import { formatPrice } from '../lib/cart';
import { X } from 'lucide-react';

interface RefundRequestDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function RefundRequestDialog({ order, isOpen, onClose, onSuccess }: RefundRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');

  const [createRefundRequest, { loading }] = useMutation(CREATE_REFUND_REQUEST, {
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
    onCompleted: () => {
      toast.success('Буцаалтын хүсэлт амжилттай илгээгдлээ');
      setReason('');
      setAmount('');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  if (!isOpen) return null;

  const maxAmount = parseInt(order.totalAmount);
  const defaultAmount = maxAmount.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Буцаалтын дүн оруулна уу!');
      return;
    }

    const refundAmount = parseFloat(amount);
    if (refundAmount > maxAmount / 100) {
      toast.error(`Буцаалтын дүн захиалгын дүнгээс их байж болохгүй!`);
      return;
    }

    try {
      await createRefundRequest({
        variables: {
          input: {
            orderId: order.id,
            reason: reason || null,
            amount: refundAmount,
          },
        },
      });
    } catch (error) {
      console.error('Create refund request error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Буцаалтын хүсэлт үүсгэх</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Захиалга #{order.id}
            </label>
            <p className="text-sm text-gray-600">Нийт дүн: {formatPrice(order.totalAmount)}₮</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Буцаалтын дүн (₮) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={maxAmount / 100}
              step="0.01"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              placeholder={defaultAmount}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Хамгийн ихдээ: {formatPrice(order.totalAmount)}₮
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Шалтгаан (сонголттой)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
              placeholder="Буцаалтын шалтгаанаа бичнэ үү..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RefundRequestDialog;
