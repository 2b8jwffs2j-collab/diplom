import { gql, useMutation, useQuery } from '@apollo/client';
import { Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { isAuthenticated } from '../lib/auth';
import { ME, RESET_PASSWORD_WITH_TOKEN } from '../lib/graphql';
import BackButton from '../components/BackButton';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

function ChangePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isResetMode = !!token; // Token байвал reset mode

  const { data: userData, loading: userLoading } = useQuery(ME, {
    skip: !isAuthenticated() || isResetMode, // Reset mode-д user query хийхгүй
  });
  const user = userData?.me;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [changePassword, { loading: changePasswordLoading }] = useMutation(CHANGE_PASSWORD, {
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const [resetPasswordWithToken, { loading: resetPasswordLoading }] = useMutation(
    RESET_PASSWORD_WITH_TOKEN,
    {
      onError: (error) => {
        toast.error(`Алдаа: ${error.message}`);
      },
    }
  );

  const loading = changePasswordLoading || resetPasswordLoading;

  useEffect(() => {
    // Token байхгүй, нэвтэрээгүй хэрэглэгч бол forgot-password хуудас руу чиглүүлэх
    if (!isResetMode && !userLoading && !user) {
      navigate('/forgot-password');
    }
  }, [userLoading, user, navigate, isResetMode]);

  // Loading үед loading spinner харуулах
  if (!isResetMode && userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isResetMode) {
      // Token-оор нууц үг солих
      if (!newPassword || !confirmPassword) {
        toast.error('Бүх талбарыг бөглөнө үү!');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Шинэ нууц үг таарахгүй байна!');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Шинэ нууц үг дор хаяж 6 тэмдэгттэй байх ёстой!');
        return;
      }

      try {
        const { data } = await resetPasswordWithToken({
          variables: {
            input: {
              token: token!,
              newPassword,
            },
          },
        });

        if (data?.resetPasswordWithToken?.success) {
          toast.success(data.resetPasswordWithToken.message);
          setNewPassword('');
          setConfirmPassword('');
          navigate('/login');
        }
      } catch (error) {
        console.error('Reset password error:', error);
      }
    } else {
      // Нэвтэрсэн хэрэглэгчийн нууц үг солих
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Бүх талбарыг бөглөнө үү!');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Шинэ нууц үг таарахгүй байна!');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Шинэ нууц үг дор хаяж 6 тэмдэгттэй байх ёстой!');
        return;
      }

      try {
        const { data } = await changePassword({
          variables: {
            input: {
              currentPassword,
              newPassword,
            },
          },
        });

        if (data?.changePassword?.success) {
          toast.success(data.changePassword.message);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          navigate('/');
        }
      } catch (error) {
        console.error('Change password error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <BackButton />
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-large border border-gray-100 p-6 sm:p-8 mt-4">
          <div className="text-center mb-6 sm:mb-8">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Нууц үг солих</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isResetMode
                ? 'Шинэ нууц үгээ оруулна уу'
                : 'Өөрийн нууц үгээ солих хүсэлтэй бол доорх маягтыг бөглөнө үү'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isResetMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Одоогийн нууц үг
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
                  placeholder="Одоогийн нууц үгээ оруулна уу"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Шинэ нууц үг</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
                placeholder="Шинэ нууц үгээ оруулна уу"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шинэ нууц үг давтах
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:shadow-md"
                placeholder="Шинэ нууц үгээ давтан оруулна уу"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:bg-gray-400 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? 'Солиж байна...' : 'Нууц үг солих'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
