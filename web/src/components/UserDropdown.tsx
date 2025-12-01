import { useApolloClient, useMutation } from '@apollo/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ChevronDown,
  Lock,
  LogOutIcon,
  Settings,
  ShoppingCart,
  Store,
  User,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearAuthToken } from '../lib/auth';
import { formatPrice } from '../lib/cart';
import { ME, UPDATE_PROFILE } from '../lib/graphql';
import ConfirmDialog from './admin/ConfirmDialog';

interface UserDropdownProps {
  user: any;
}

function UserDropdown({ user }: UserDropdownProps) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: '',
  });

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: ME }],
    onCompleted: () => {
      toast.success('Профайл амжилттай шинэчлэгдлээ!');
      setShowEditProfile(false);
    },
    onError: (error) => {
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  // Guard clause: if user is not provided, don't render
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    clearAuthToken();
    client.clearStore().then(() => {
      client.resetStore();
      navigate('/');
    });
  };

  const handleLogoutConfirm = () => {
    handleLogout();
    setShowLogoutDialog(false);
  };

  const handleProfileUpdate = () => {
    updateProfile({
      variables: {
        input: {
          firstName: profileData.firstName || undefined,
          lastName: profileData.lastName || undefined,
          phone: profileData.phone || undefined,
          address: profileData.address || undefined,
          bio: profileData.bio || undefined,
        },
      },
    });
  };

  const getRoleIcon = () => {
    if (user.role === 'ADMIN') return <Settings className="w-5 h-5" />;
    if (user.role === 'SELLER') return <Store className="w-5 h-5" />;
    return <User className="w-5 h-5" />;
  };

  const getRoleLabel = () => {
    if (user.role === 'ADMIN') return 'Админ';
    if (user.role === 'SELLER') return 'Худалдагч';
    return 'Худалдан авагч';
  };

  const displayName =
    user.profile?.firstName || user.profile?.lastName
      ? `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
      : user.email;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              {user.profile?.firstName?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[240px] z-50"
            sideOffset={5}
          >
            {/* User Info Header */}
            <div className="px-3 py-2 border-b border-gray-200 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user.profile?.firstName?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getRoleIcon()}
                    <span className="text-xs text-gray-600">{getRoleLabel()}</span>
                  </div>
                </div>
              </div>
              {user.role === 'BUYER' && user.wallet && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <WalletIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Баланс:</span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(user.wallet.balance)}₮
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            {/* <DropdownMenu.Item
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
              onSelect={() => {
                setProfileData({
                  firstName: user.profile?.firstName || '',
                  lastName: user.profile?.lastName || '',
                  phone: user.profile?.phone || '',
                  address: user.profile?.address || '',
                  bio: user.profile?.bio || '',
                });
                setShowEditProfile(true);
              }}
            >
              <Edit className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Хувийн мэдээлэл</span>
            </DropdownMenu.Item> */}

            {user.role === 'BUYER' && (
              <>
                <DropdownMenu.Item
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
                  asChild
                >
                  <Link to="/orders">
                    <ShoppingCart className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Захиалга</span>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
                  asChild
                >
                  <Link to="/wallet">
                    <WalletIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Хэтэвч</span>
                  </Link>
                </DropdownMenu.Item>
              </>
            )}

            {user.role === 'ADMIN' && (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
                asChild
              >
                <Link to="/admin">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Админ самбар</span>
                </Link>
              </DropdownMenu.Item>
            )}

            {user.role === 'SELLER' && (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
                asChild
              >
                <Link to="/seller">
                  <Store className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Худалдагч самбар</span>
                </Link>
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

            <DropdownMenu.Item
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer outline-none"
              asChild
            >
              <Link to="/change-password">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Нууц үг солих</span>
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

            <DropdownMenu.Item
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 cursor-pointer outline-none"
              onSelect={() => setShowLogoutDialog(true)}
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Гарах</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Edit Profile Dialog */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Хувийн мэдээлэл засах</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Нэр"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Овог</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Овог"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Утас</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Утасны дугаар"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Хаяг"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Товч танилцуулга
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Товч танилцуулга"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Цуцлах
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
              >
                {updating ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Системээс гарах"
        description="Та системээс гарахдаа итгэлтэй байна уу?"
        confirmLabel="Тийм, гарах"
        cancelLabel="Цуцлах"
        onConfirm={handleLogoutConfirm}
        variant="danger"
      />
    </>
  );
}

export default UserDropdown;
