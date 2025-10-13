import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, companyAPI } from "../../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("users");
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await userAPI.getAllUsers();
    if (result.success) {
      setUsers(result.data);
    }
    setIsLoading(false);
  };

  const loadCompanies = async () => {
    const result = await companyAPI.getAllCompanies();
    if (result.success) {
      setCompanies(result.data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/signin");
  };

  const renderUsers = () => {
    const regularUsers = users.filter(u => u.role === 'user');
    const companyUsers = users.filter(u => u.role === 'company');
    const adminUsers = users.filter(u => u.role === 'admin');

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registered Users</h2>
          <button
            onClick={loadUsers}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="bg-blue-800 p-4 rounded-lg">
            <h3 className="text-gray-300 text-sm mb-1">Regular Users</h3>
            <p className="text-3xl font-bold">{regularUsers.length}</p>
          </div>
          <div className="bg-green-800 p-4 rounded-lg">
            <h3 className="text-gray-300 text-sm mb-1">Companies</h3>
            <p className="text-3xl font-bold">{companyUsers.length}</p>
          </div>
          <div className="bg-purple-800 p-4 rounded-lg">
            <h3 className="text-gray-300 text-sm mb-1">Admins</h3>
            <p className="text-3xl font-bold">{adminUsers.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Admin Users */}
            {adminUsers.length > 0 && (
              <div className="bg-purple-900 bg-opacity-30 p-4 rounded-lg border border-purple-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">ADMIN</span>
                  Admin Users ({adminUsers.length})
                </h3>
                <div className="space-y-3">
                  {adminUsers.map((user) => (
                    <div key={user._id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={user.profilePicture || "https://via.placeholder.com/50"}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-bold">{user.name}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Users */}
            {companyUsers.length > 0 && (
              <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="bg-green-600 px-3 py-1 rounded-full text-sm">COMPANY</span>
                  Company Accounts ({companyUsers.length})
                </h3>
                <div className="space-y-3">
                  {companyUsers.map((user) => (
                    <div key={user._id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={user.profilePicture || "https://via.placeholder.com/50"}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-bold">{user.name}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                            <p className="text-sm text-gray-500">{user.college}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Users */}
            {regularUsers.length > 0 && (
              <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">USER</span>
                  Regular Users ({regularUsers.length})
                </h3>
                <div className="space-y-3">
                  {regularUsers.map((user) => (
                    <div key={user._id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={user.profilePicture || "https://via.placeholder.com/50"}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold">{user.name}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span>📚 {user.college}</span>
                              <span>🎓 {user.department}</span>
                              <span>📞 {user.phone}</span>
                            </div>
                            {user.skills && user.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {user.skills.slice(0, 5).map((skill, idx) => (
                                  <span key={idx} className="bg-blue-600 px-2 py-1 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-yellow-400 font-bold">⭐ {user.score} pts</p>
                          <p className="text-gray-400">✅ {user.tasksCompleted} tasks</p>
                          <p className="text-gray-500 mt-2">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCompanies = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registered Companies</h2>
          <button
            onClick={loadCompanies}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <h3 className="text-gray-400 text-sm mb-1">Total Companies</h3>
          <p className="text-3xl font-bold">{companies.length}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : companies.length > 0 ? (
          <div className="space-y-4">
            {companies.map((company) => (
              <div key={company._id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <img
                    src={company.logo || "https://via.placeholder.com/80"}
                    alt={company.companyName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{company.companyName}</h3>
                      {company.isVerified && (
                        <span className="bg-green-600 px-2 py-1 rounded text-xs">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-2">{company.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Industry</p>
                        <p className="font-semibold">{company.industry}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Location</p>
                        <p className="font-semibold">{company.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Employees</p>
                        <p className="font-semibold">{company.totalEmployees}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Projects</p>
                        <p className="font-semibold">{company.activeProjects}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm text-gray-400">
                      <span>📧 {company.email}</span>
                      <span>📞 {company.phone}</span>
                      {company.website && <span>🌐 {company.website}</span>}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-400">Registered: {new Date(company.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No companies registered yet.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage users and companies</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveView("users")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeView === "users"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveView("companies")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeView === "companies"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Companies
          </button>
        </div>

        {/* Content Area */}
        {activeView === "users" && renderUsers()}
        {activeView === "companies" && renderCompanies()}
      </div>
    </div>
  );
}
