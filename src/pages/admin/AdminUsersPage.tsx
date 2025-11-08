import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { 
  ArrowRight,
  Search,
  Users,
  Crown,
  UserCheck,
  Calendar,
  Mail,
  Trash2,
  Shield
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { getUsers, deleteUser } from "../../utils/adminApi";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: string;
  isPremium?: boolean;
  premiumEndDate?: string;
}

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "regular">("all");

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم: ${userName}؟`)) {
      return;
    }

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
        alert("تم حذف المستخدم بنجاح");
      } else {
        alert("فشل حذف المستخدم");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("حدث خطأ أثناء حذف المستخدم");
    }
  };

  // Filter users based on search and filter type
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === "premium") {
      return user.isPremium;
    } else if (filter === "regular") {
      return !user.isPremium;
    }
    return true;
  });

  // Calculate stats
  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.isPremium).length;
  const regularUsers = totalUsers - premiumUsers;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة التحكم
          </Button>
          <h1 className="text-3xl mb-2">إدارة المستخدمين</h1>
          <p className="text-white/90">إدارة حسابات المستخدمين والاشتراكات</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي المستخدمين</p>
                <p className="text-3xl">{loading ? "..." : totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">مشتركين Premium</p>
                <p className="text-3xl">{loading ? "..." : premiumUsers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">مستخدمين عاديين</p>
                <p className="text-3xl">{loading ? "..." : regularUsers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="البحث عن مستخدم (الاسم أو البريد)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                الكل ({totalUsers})
              </Button>
              <Button
                variant={filter === "premium" ? "default" : "outline"}
                onClick={() => setFilter("premium")}
                className={filter === "premium" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <Crown className="ml-2 h-4 w-4" />
                Premium ({premiumUsers})
              </Button>
              <Button
                variant={filter === "regular" ? "default" : "outline"}
                onClick={() => setFilter("regular")}
              >
                عادي ({regularUsers})
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">جاري تحميل المستخدمين...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">لا يوجد مستخدمين</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "لا توجد نتائج للبحث" : "لم يتم تسجيل أي مستخدمين بعد"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">المستخدم</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">البريد الإلكتروني</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">تاريخ التسجيل</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">انتهاء Premium</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white h-10 w-10 rounded-full flex items-center justify-center">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            {user.role === "admin" && (
                              <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                <Shield className="h-3 w-3" />
                                مدير
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                            <Crown className="h-3 w-3" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            عادي
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.isPremium && user.premiumEndDate ? (
                          <span className="text-sm text-gray-600">
                            {new Date(user.premiumEndDate).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            عرض {filteredUsers.length} من {totalUsers} مستخدم
          </div>
        )}
      </div>
    </div>
  );
}
