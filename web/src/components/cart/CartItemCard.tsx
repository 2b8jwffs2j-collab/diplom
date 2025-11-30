import { Image as ImageIcon } from 'lucide-react';
import { formatPrice } from '../../lib/cart';
import { CartItem } from '../../lib/cart';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Image */}
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>
          <p className="text-blue-600 font-bold text-sm sm:text-base">{formatPrice(item.price)}₮</p>
          {(!item.stock || item.stock === 0) && (
            <p className="text-xs text-red-600 font-medium mt-1">⚠️ Нөөцөд байхгүй байна</p>
          )}
        </div>

        {/* Quantity and Actions */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              className="bg-gray-200 px-2.5 sm:px-3 py-1 rounded hover:bg-gray-300 text-sm sm:text-base"
            >
              -
            </button>
            <span className="font-medium text-sm sm:text-base min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="bg-gray-200 px-2.5 sm:px-3 py-1 rounded hover:bg-gray-300 text-sm sm:text-base"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="font-bold text-gray-800 text-sm sm:text-base">
              {formatPrice(parseInt(item.price) * item.quantity)}₮
            </p>
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(item.productId)}
            className="text-blue-600 hover:text-blue-700 text-lg sm:text-xl"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
