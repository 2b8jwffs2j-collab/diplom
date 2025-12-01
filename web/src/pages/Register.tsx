import { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingCart, Store } from 'lucide-react';
import { REGISTER } from '../lib/graphql';
import { setAuthToken } from '../lib/auth';

function Register() {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'BUYER' as 'BUYER' | 'SELLER',
  });

  const [register, { loading }] = useMutation(REGISTER, {
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('И-мэйл болон нууц үг оруулна уу!');
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Утасны дугаар оруулна уу!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Нууц үг таарахгүй байна!');
      return;
    }

    try {
      const { data } = await register({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
            role: formData.role,
            firstName: formData.firstName || undefined,
            lastName: formData.lastName || undefined,
            phone: formData.phone,
          },
        },
      });

      if (data?.register) {
        // Token-ийг эхлээд тохируулах
        setAuthToken(data.register.token);

        // Apollo cache цэвэрлэх, дараа нь reset хийх
        await client.clearStore();
        await client.resetStore();

        toast.success('Амжилттай бүртгүүллээ!');

        // Navigate хийх (cache reset дуусна)
        navigate('/');
      }
    } catch {
      // Error already handled in onError
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-large border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Бүртгүүлэх</h1>
          <p className="text-sm sm:text-base text-gray-600">Шинэ бүртгэл үүсгэх</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Та хэн байх вэ?</label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                className={`py-3 sm:py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                  formData.role === 'BUYER'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">Худалдан авагч</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                className={`py-3 sm:py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                  formData.role === 'SELLER'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-base">Худалдагч</span>
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">И-мэйл хаяг *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              placeholder="user@example.mn"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Нэр</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md text-sm sm:text-base"
                placeholder="Батаа"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Овог</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md text-sm sm:text-base"
                placeholder="Доржийн"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              placeholder="99001122"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нууц үг *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нууц үг давтах *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? 'Уншиж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Бүртгэлтэй юу?{' '}
          <Link to="/login" className="text-blue-500 font-medium hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
