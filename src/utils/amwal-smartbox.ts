// Amwal Pay SmartBox Integration Utility
// This utility handles the SmartBox payment popup configuration and callbacks

import { projectId, publicAnonKey } from './supabase/info';

// Extend Window interface to include SmartBox
declare global {
  interface Window {
    SmartBox?: {
      Checkout: {
        configure: (config: AmwalSmartBoxConfig) => void;
        show?: () => void;
      };
    };
  }
}

// SmartBox Configuration Interface
export interface AmwalSmartBoxConfig {
  MID: string; // Merchant ID
  TID: string; // Terminal ID
  CurrencyId: number; // 512 for OMR (Omani Rial)
  AmountTrxn: number; // Amount to be paid
  MerchantReference: string; // Unique transaction reference
  LanguageId: 'ar' | 'en'; // Language
  PaymentViewType: 1 | 2; // 1 = Popup, 2 = Full Screen
  TrxDateTime: string; // Transaction date time (YYYY-MM-DD HH:MM:SS)
  SessionToken: string | null; // For recurring payments (optional)
  ContactInfoType: 1 | 2 | 3 | 4; // 1=all, 2=email, 3=phone, 4=none
  SecureHash: string; // Secure hash value calculated by server
  completeCallback: (data: PaymentCompleteData) => void;
  errorCallback: (data: PaymentErrorData) => void;
  cancelCallback: () => void;
}

// Payment Complete Data Interface
export interface PaymentCompleteData {
  TransactionId?: string;
  MerchantReference?: string;
  Amount?: number;
  Status?: string;
  [key: string]: any; // Allow additional fields from Amwal
}

// Payment Error Data Interface
export interface PaymentErrorData {
  ErrorCode?: string;
  ErrorMessage?: string;
  [key: string]: any; // Allow additional fields from Amwal
}

// Response from server when preparing SmartBox
export interface SmartBoxPrepareResponse {
  success: boolean;
  sandboxMode?: boolean;
  config?: AmwalSmartBoxConfig;
  transactionRef?: string;
  planDetails?: {
    name: string;
    amount: number;
    duration: number;
  };
  error?: string;
  message?: string;
}

/**
 * Initialize Amwal Pay SmartBox with configuration
 * @param planType - Plan type: 'semiannual' or 'yearly'
 * @param userId - User ID
 * @param userEmail - User email
 * @param userName - User name
 * @param onSuccess - Callback on payment success
 * @param onError - Callback on payment error
 * @param onCancel - Callback on payment cancellation
 */
export async function initializeSmartBox(
  planType: 'semiannual' | 'yearly',
  userId: string,
  userEmail: string,
  userName: string,
  onSuccess: (data: PaymentCompleteData) => void,
  onError: (data: PaymentErrorData) => void,
  onCancel: () => void
): Promise<{ success: boolean; error?: string; sandboxMode?: boolean }> {
  try {
    // Check if SmartBox script is loaded
    if (!window.SmartBox) {
      console.error("❌ SmartBox script not loaded. Please ensure SmartBox.js is included.");
      return {
        success: false,
        error: "نظام الدفع غير محمّل. يرجى إعادة تحميل الصفحة."
      };
    }

    console.log("🔵 Preparing SmartBox configuration from server...");

    // Request configuration from server
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8a20c00b/payment/prepare-smartbox`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          planType,
          userId,
          userEmail,
          userName
        })
      }
    );

    const data: SmartBoxPrepareResponse = await response.json();

    if (!response.ok || !data.success) {
      console.error("❌ Failed to prepare SmartBox configuration:", data);
      return {
        success: false,
        error: data.error || "فشل إعداد نظام الدفع"
      };
    }

    if (!data.config) {
      console.error("❌ No configuration returned from server");
      return {
        success: false,
        error: "لم يتم الحصول على إعدادات الدفع"
      };
    }

    console.log("✅ SmartBox configuration received:", {
      sandboxMode: data.sandboxMode,
      transactionRef: data.transactionRef,
      amount: data.config.AmountTrxn
    });

    // Build complete SmartBox configuration with callbacks
    const smartBoxConfig: AmwalSmartBoxConfig = {
      ...data.config,
      completeCallback: (paymentData: PaymentCompleteData) => {
        console.log("✅ Payment completed successfully:", paymentData);
        onSuccess(paymentData);
      },
      errorCallback: (errorData: PaymentErrorData) => {
        console.error("❌ Payment error:", errorData);
        onError(errorData);
      },
      cancelCallback: () => {
        console.log("⚠️ Payment cancelled by user");
        onCancel();
      }
    };

    // Configure SmartBox
    console.log("🔧 Configuring SmartBox...");
    window.SmartBox.Checkout.configure = smartBoxConfig;

    // Optional: Show SmartBox immediately (if method exists)
    if (typeof window.SmartBox.Checkout.show === 'function') {
      console.log("🎬 Showing SmartBox payment popup...");
      window.SmartBox.Checkout.show();
    } else {
      console.log("ℹ️ SmartBox configured. Payment will trigger automatically.");
    }

    return {
      success: true,
      sandboxMode: data.sandboxMode
    };

  } catch (error) {
    console.error("❌ Error initializing SmartBox:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء تهيئة نظام الدفع: " + String(error)
    };
  }
}

/**
 * Check if SmartBox script is loaded
 */
export function isSmartBoxLoaded(): boolean {
  return typeof window.SmartBox !== 'undefined';
}

/**
 * Wait for SmartBox to load (with timeout)
 * @param timeout - Timeout in milliseconds (default: 10000ms = 10s)
 */
export function waitForSmartBox(timeout: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isSmartBoxLoaded()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isSmartBoxLoaded()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.error("❌ SmartBox script loading timeout");
        resolve(false);
      }
    }, 100);
  });
}
