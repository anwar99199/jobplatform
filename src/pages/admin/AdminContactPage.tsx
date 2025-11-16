import { useState, useEffect } from "react";
import { MessageSquare, Mail, Phone, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  request_type: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminContactPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    checkAdminAndLoadMessages();
  }, []);

  const checkAdminAndLoadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!userData || userData.role !== "admin") {
        toast.error("غير مصرح لك بالوصول إلى هذه الصفحة");
        navigate("/");
        return;
      }

      await loadMessages();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/admin/login");
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يرجى تسجيل الدخول");
        navigate("/admin/login");
        return;
      }

      // Call server API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/contact-messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Error loading messages:", result.error);
        toast.error("فشل تحميل الرسائل");
        return;
      }

      setMessages(result.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("حدث خطأ أثناء تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, newStatus: string) => {
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يرجى تسجيل الدخول");
        navigate("/admin/login");
        return;
      }

      // Call server API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/admin/contact-messages/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Error updating status:", result.error);
        toast.error("فشل تحديث الحالة");
        return;
      }

      toast.success("تم تحديث حالة الرسالة");
      await loadMessages();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      general: "استفسار عام",
      technical: "مشكلة تقنية",
      refund: "استرداد مبلغ / اشتراك",
      "ai-service": "خدمة الذكاء الاصطناعي"
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: "جديد",
      "in-progress": "قيد المعالجة",
      resolved: "تم الحل",
      closed: "مغلق"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredMessages = filter === "all" 
    ? messages 
    : messages.filter(msg => msg.status === filter);

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === "new").length,
    inProgress: messages.filter(m => m.status === "in-progress").length,
    resolved: messages.filter(m => m.status === "resolved").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin/dashboard")}
                className="hover:bg-gray-100"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة
              </Button>
              <div>
                <h1 className="text-2xl text-gray-800">رسائل التواصل</h1>
                <p className="text-gray-600 text-sm mt-1">
                  إدارة رسائل المستخدمين والرد عليها
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl text-gray-800 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">إجمالي الرسائل</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl text-blue-800 mb-1">{stats.new}</div>
              <div className="text-sm text-blue-600">رسائل جديدة</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl text-yellow-800 mb-1">{stats.inProgress}</div>
              <div className="text-sm text-yellow-600">قيد المعالجة</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl text-green-800 mb-1">{stats.resolved}</div>
              <div className="text-sm text-green-600">تم الحل</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-red-600" : ""}
          >
            الكل ({stats.total})
          </Button>
          <Button
            variant={filter === "new" ? "default" : "outline"}
            onClick={() => setFilter("new")}
            className={filter === "new" ? "bg-red-600" : ""}
          >
            جديد ({stats.new})
          </Button>
          <Button
            variant={filter === "in-progress" ? "default" : "outline"}
            onClick={() => setFilter("in-progress")}
            className={filter === "in-progress" ? "bg-red-600" : ""}
          >
            قيد المعالجة ({stats.inProgress})
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            onClick={() => setFilter("resolved")}
            className={filter === "resolved" ? "bg-red-600" : ""}
          >
            تم الحل ({stats.resolved})
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد رسائل</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg text-gray-800">{message.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                        {getStatusLabel(message.status)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {getRequestTypeLabel(message.request_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${message.email}`} className="hover:text-red-600">
                          {message.email}
                        </a>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${message.phone}`} className="hover:text-red-600">
                            {message.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(message.created_at).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                </div>

                <div className="flex gap-2">
                  {message.status === "new" && (
                    <Button
                      size="sm"
                      onClick={() => updateMessageStatus(message.id, "in-progress")}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      بدء المعالجة
                    </Button>
                  )}
                  {message.status === "in-progress" && (
                    <Button
                      size="sm"
                      onClick={() => updateMessageStatus(message.id, "resolved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="ml-1 w-4 h-4" />
                      تم الحل
                    </Button>
                  )}
                  {message.status === "resolved" && (
                    <Button
                      size="sm"
                      onClick={() => updateMessageStatus(message.id, "closed")}
                      variant="outline"
                    >
                      <XCircle className="ml-1 w-4 h-4" />
                      إغلاق
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}