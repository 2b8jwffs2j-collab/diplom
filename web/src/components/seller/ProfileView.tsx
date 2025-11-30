interface ProfileViewProps {
  meData: any;
}

function ProfileView({ meData }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Профайл</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">И-мэйл</label>
            <input
              type="email"
              value={meData?.me?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Эрх</label>
            <input
              type="text"
              value={meData?.me?.role || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Нэр</label>
            <input
              type="text"
              value={meData?.me?.profile?.firstName || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <p className="text-sm text-gray-600">Профайл засах функц хөгжүүлэгдэж байна...</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;
