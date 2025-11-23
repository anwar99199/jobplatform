import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, FileText, CreditCard, Target, Wand2 } from 'lucide-react';

interface PremiumService {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
}

const premiumServices: PremiumService[] = [
  {
    id: 1,
    title: 'توليد خطاب التقديم بالذكاء الاصطناعي',
    icon: FileText,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    title: 'البطاقة الرقمية الاحترافية',
    icon: CreditCard,
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 3,
    title: 'نسبة التوافق مع الوظائف',
    icon: Target,
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-green-600'
  },
  {
    id: 4,
    title: 'محول السيرة الذاتية لأنظمة ATS',
    icon: Wand2,
    color: 'text-orange-600',
    bgGradient: 'from-orange-500 to-orange-600'
  }
];

export function PremiumFloatingPromo() {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  const currentService = premiumServices[currentServiceIndex];
  const Icon = currentService.icon;

  // تحديث عرض الشاشة
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // تبديل الخدمة المعروضة كل 4 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % premiumServices.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // إخفاء البرومو بعد التمرير لأسفل
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1500) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    navigate('/premium');
  };

  if (!isVisible) return null;

  // حساب نقاط الحركة بناءً على عرض الشاشة
  const maxX = windowWidth - 160; // 160 = عرض العنصر تقريباً

  return (
    <motion.div
      className="fixed bottom-8 z-50 cursor-pointer"
      initial={{ x: 20, opacity: 0 }}
      animate={{ 
        x: [20, maxX, 20],
        opacity: 1 
      }}
      transition={{
        x: {
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "reverse"
        },
        opacity: {
          duration: 0.5
        }
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`relative bg-gradient-to-r ${currentService.bgGradient} rounded-2xl shadow-2xl p-5 hover:shadow-3xl transition-all duration-300 border-4 border-white`}>
        {/* تأثير الوهج */}
        <div className="absolute inset-0 rounded-2xl bg-white opacity-30 blur-xl animate-pulse"></div>
        
        {/* النجمة المتلألئة - أعلى اليمين */}
        <motion.div
          className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-900" />
        </motion.div>

        {/* الأيقونة الرئيسية */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentService.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Icon className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
          </motion.div>
        </AnimatePresence>

        {/* شارة "Premium" */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-1 rounded-full text-xs shadow-lg whitespace-nowrap border-2 border-yellow-600">
          ⭐ Premium ⭐
        </div>
      </div>

      {/* Tooltip مع اسم الخدمة */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentService.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-1/2 left-28 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl px-5 py-3 pointer-events-none min-w-max border-2 border-gray-100"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-800">{currentService.title}</span>
            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full shadow-md animate-pulse">جديد</span>
          </div>
          {/* السهم */}
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white"></div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}