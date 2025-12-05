import { useAuth } from "../hooks/useAuth";

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen) return null; // do not render if modal is closed

  if (!user)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
          <p className="text-gray-500 text-lg">Please login first.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          My Profile
        </h1>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Name</span>
            <span className="text-gray-900 font-semibold">
              {user.firstName} {user.lastName}
            </span>
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Email</span>
            <span className="text-gray-900 font-semibold">{user.email}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">Role</span>
            <span className="text-gray-900 font-semibold">{user.role}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm">
            <span className="text-gray-700 font-medium">User ID</span>
            <span className="text-gray-900 font-semibold">{user.id}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Manage your account details securely.
          </p>
        </div>
      </div>
    </div>
  );
}
