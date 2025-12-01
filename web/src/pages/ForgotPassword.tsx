import { useMutation } from '@apollo/client';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import { REQUEST_PASSWORD_RESET } from '../lib/graphql';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [requestPasswordReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('И-мэйл хаягаа оруулна уу!');
      return;
    }

    try {
      const { data } = await requestPasswordReset({
        variables: {
          input: { email },
        },
      });

      if (data?.requestPasswordReset?.success) {
        toast.success(data.requestPasswordReset.message);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Request password reset error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <BackButton />
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-large border border-gray-100 p-6 sm:p-8 mt-4">
          <div className="text-center mb-6 sm:mb-8">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Нууц үг сэргээх</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {submitted
                ? 'Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх линк имэйлдээ ирнэ'
                : 'И-мэйл хаягаа оруулна уу. Бид танд нууц үг сэргээх линк илгээх болно'}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">И-мэйл хаяг</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
                  placeholder="user@example.mn"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                {loading ? 'Илгээж байна...' : 'Линк илгээх'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800">
                  Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх линк имэйлдээ ирнэ. Имэйлээ шалгана
                  уу.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Анхаар: Одоогоор token-ийг backend console-оос авч болно (email илгээх функц
                  хараахан нэмэгдээгүй).
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-gray-600 mt-6">
            <Link to="/login" className="text-blue-500 font-medium hover:underline">
              Нэвтрэх хуудас руу буцах
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
