import { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { LOGIN } from '../lib/graphql';
import { setAuthToken } from '../lib/auth';

function Login() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading }] = useMutation(LOGIN, {
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Бүх талбарыг бөглөнө үү!');
      return;
    }

    try {
      const { data } = await login({
        variables: {
          input: { email, password },
        },
      });

      if (data?.login) {
        // Token-ийг эхлээд тохируулах
        setAuthToken(data.login.token);

        // Apollo cache цэвэрлэх, дараа нь reset хийх
        await client.clearStore();
        await client.resetStore();

        toast.success('Амжилттай нэвтэрлээ!');

        // Navigate хийх (cache reset дуусна)
        if (data.login.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-large border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Нэвтрэх</h1>
          <p className="text-sm sm:text-base text-gray-600">Тавтай морилно уу</p>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? 'Уншиж байна...' : 'Нэвтрэх'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Бүртгэлгүй юу?{' '}
          <Link to="/register" className="text-blue-500 font-medium hover:underline">
            Бүртгүүлэх
          </Link>
        </p>

        {/* Demo Accounts */}
        {/* <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3 text-xs sm:text-sm">Demo бүртгэлүүд:</h3>
          <div className="text-xs sm:text-sm text-gray-700 space-y-2">
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>buyer@example.mn / password123</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span>saruul@example.mn / password123</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span>admin@handmade.mn / admin123</span>
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default Login;
