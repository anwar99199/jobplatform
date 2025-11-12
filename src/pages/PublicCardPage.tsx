import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Linkedin,
  MessageCircle,
  FileText,
  AlertCircle,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { supabase } from "../utils/supabase/client";

export function PublicCardPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadCard(id);
    }
  }, [id]);

  const loadCard = async (cardId: string) => {
    try {
      console.log("Loading card with ID:", cardId);
      
      const { data, error } = await supabase
        .from("digital_cards")
        .select("*")
        .eq("id", cardId)
        .single();

      console.log("Card data:", data);
      console.log("Card error:", error);

      if (error) {
        console.error("Supabase error:", error);
        setNotFound(true);
      } else if (!data) {
        console.error("No card found");
        setNotFound(true);
      } else if (!data.is_active) {
        console.error("Card is not active");
        setNotFound(true);
      } else {
        setCard(data);
      }
    } catch (err) {
      console.error("Error loading card:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          <p className="mt-4 text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl text-white mb-4">البطاقة غير موجودة</h2>
            <p className="text-gray-400 mb-6">
              عذراً، لم نتمكن من العثور على هذه البطاقة. قد تكون محذوفة أو غير نشطة.
            </p>
            <Link to="/">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card Container */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-yellow-500/20">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-8 text-center">
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
              {card.profile_image_url ? (
                <img
                  src={card.profile_image_url}
                  alt={card.full_name}
                  className="w-40 h-40 rounded-full object-cover border-4 border-yellow-500 shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center border-4 border-yellow-500 shadow-xl">
                  <User className="w-20 h-20 text-black" />
                </div>
              )}
            </div>

            {/* Name & Title */}
            <h1 className="text-3xl text-white mb-3">
              {card.full_name}
            </h1>
            {card.job_title && (
              <p className="text-xl text-yellow-500 mb-2">{card.job_title}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="p-8">
            <div className="space-y-4 mb-8">
              {card.phone && (
                <a
                  href={`tel:${card.phone}`}
                  className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                    <Phone className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">الهاتف</p>
                    <p className="text-white" dir="ltr">{card.phone}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </a>
              )}

              {card.whatsapp && (
                <a
                  href={`https://wa.me/${card.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">واتساب</p>
                    <p className="text-white">أرسل رسالة</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </a>
              )}

              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">البريد الإلكتروني</p>
                    <p className="text-white text-sm break-all" dir="ltr">{card.email}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </a>
              )}

              {card.linkedin && (
                <a
                  href={card.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                    <Linkedin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">LinkedIn</p>
                    <p className="text-white">عرض الملف الشخصي</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </a>
              )}
            </div>

            {/* Bio Section */}
            {card.bio && (
              <div className="mb-8">
                <div className="border-t border-gray-700 mb-6"></div>
                <h3 className="text-lg text-yellow-500 mb-3">نبذة شخصية</h3>
                <p className="text-gray-300 leading-relaxed">
                  {card.bio}
                </p>
              </div>
            )}

            {/* CV Download Button */}
            {card.cv_url && (
              <div className="mb-6">
                <div className="border-t border-gray-700 mb-6"></div>
                <a
                  href={card.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-6">
                    <FileText className="w-5 h-5 ml-2" />
                    تحميل السيرة الذاتية
                  </Button>
                </a>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                تم الإنشاء عبر منصة{" "}
                <Link to="/" className="text-yellow-500 hover:text-yellow-400">
                  منصة عُمان للوظائف
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicCardPage;