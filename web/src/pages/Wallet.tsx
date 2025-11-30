import { useMutation, useQuery } from '@apollo/client';
import { Wallet as WalletIcon, ArrowUp, ArrowDown, RotateCcw, ArrowDownToLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/mn';
import { isAuthenticated } from '../lib/auth';
import { formatPrice } from '../lib/cart';
import { MY_WALLET, TOP_UP_FAKE } from '../lib/graphql';
import BackButton from '../components/BackButton';

function Wallet() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');

  const { data, loading, refetch } = useQuery(MY_WALLET, {
    skip: !isAuthenticated(),
  });

  const [topUpFake, { loading: topUpLoading }] = useMutation(TOP_UP_FAKE, {
    onCompleted: () => {
      refetch();
      setAmount('');
      toast.success('Амжилттай цэнэглэлээ!');
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleTopUp = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Зөв дүн оруулна уу!');
      return;
    }

    await topUpFake({ variables: { amount: amountNum } });
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const wallet = data?.myWallet;
  const balance = wallet ? parseInt(wallet.balance) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <WalletIcon className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold">Миний түрийвч</h1>
        </div>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Үлдэгдэл</h2>
            <p className="text-5xl font-bold mb-2">{formatPrice(balance)}₮</p>
            <p className="text-primary-100">Худалдан авалт хийхэд бэлэн</p>
          </div>

          {/* Top-up Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Цэнэглэх (Demo)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Энэ нь demo цэнэглэлт юм. Production дээр Stripe эсвэл банкны шилжүүлэг ашиглана.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Дүн (₮)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 "
              />
            </div>
            <button
              onClick={handleTopUp}
              disabled={topUpLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold  transition disabled:bg-gray-400"
            >
              {topUpLoading ? 'Уншиж байна...' : 'Цэнэглэх'}
            </button>

            {/* Quick amounts */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="bg-gray-100 py-2 rounded hover:bg-gray-200 transition text-sm"
                >
                  {(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Гүйлгээний түүх</h2>

            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-4">
                {wallet.transactions.map((tx: any) => {
                  const amount = parseInt(tx.amount);
                  const isPositive = amount >= 0;

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between border-b pb-4 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {tx.type === 'TOP_UP' && <ArrowUp className="w-5 h-5 text-blue-600" />}
                          {tx.type === 'PURCHASE' && (
                            <ArrowDown className="w-5 h-5 text-blue-700" />
                          )}
                          {tx.type === 'REFUND' && <RotateCcw className="w-5 h-5 text-green-600" />}
                          {tx.type === 'WITHDRAWAL' && (
                            <ArrowDownToLine className="w-5 h-5 text-red-600" />
                          )}
                          <p className="font-semibold text-gray-800">
                            {tx.type === 'TOP_UP' && 'Цэнэглэлт'}
                            {tx.type === 'PURCHASE' && 'Худалдан авалт'}
                            {tx.type === 'REFUND' && 'Буцаалт'}
                            {tx.type === 'WITHDRAWAL' && 'Татан авалт'}
                          </p>
                        </div>
                        {tx.description && (
                          <p className="text-sm text-gray-600 ml-7">{tx.description}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-7">
                          {dayjs(tx.createdAt).locale('mn').format('YYYY-MM-DD HH:mm')}
                        </p>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isPositive ? 'text-blue-600' : 'text-blue-700'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatPrice(Math.abs(amount))}₮
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">Гүйлгээ олдсонгүй</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
