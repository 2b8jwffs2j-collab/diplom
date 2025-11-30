import { toast } from 'sonner';

interface ApproveStockRequestDialogProps {
  open: boolean;
  requestId: number | null;
  expectedDate: string;
  onExpectedDateChange: (date: string) => void;
  onApprove: (requestId: number, expectedDate: string) => void;
  onClose: () => void;
}

function ApproveStockRequestDialog({
  open,
  requestId,
  expectedDate,
  onExpectedDateChange,
  onApprove,
  onClose,
}: ApproveStockRequestDialogProps) {
  if (!open) return null;

  const handleApprove = () => {
    if (!expectedDate) {
      toast.error('Дуусах цаг хугацаа оруулна уу!');
      return;
    }
    if (requestId) {
      onApprove(requestId, expectedDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Хүсэлт зөвшөөрөх</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Хэзээ дуусах цаг хугацаа *
        </label>
        <input
          type="datetime-local"
          value={expectedDate}
          onChange={(e) => onExpectedDateChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
          required
        />
        <div className="flex space-x-2">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Зөвшөөрөх
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
          >
            Цуцлах
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApproveStockRequestDialog;
