import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AdminSecurityConfig } from '../types';

export const DEFAULT_ADMIN_EMAIL = 'bytera.ttech@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'ByteraSecure2026!';
export const DEFAULT_RECOVERY_PHONE = '201033108223';

/**
 * Fetch current admin security credentials from Firestore
 */
export async function getAdminSecurityConfig(): Promise<AdminSecurityConfig> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'admin_security'));
    if (docSnap.exists()) {
      const data = docSnap.data() as AdminSecurityConfig;
      return {
        adminEmail: data.adminEmail || DEFAULT_ADMIN_EMAIL,
        adminPassword: data.adminPassword || DEFAULT_ADMIN_PASSWORD,
        recoveryPhone: data.recoveryPhone || DEFAULT_RECOVERY_PHONE,
        recoveryOtp: data.recoveryOtp,
        recoveryOtpExpiresAt: data.recoveryOtpExpiresAt,
        lastPasswordChangedAt: data.lastPasswordChangedAt
      };
    }
  } catch (err) {
    console.warn('Failed to fetch admin security from Firestore, using local/defaults:', err);
  }

  // Fallback to localStorage or default
  try {
    const local = localStorage.getItem('cms_admin_security');
    if (local) {
      return JSON.parse(local);
    }
  } catch (_) {}

  return {
    adminEmail: DEFAULT_ADMIN_EMAIL,
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    recoveryPhone: DEFAULT_RECOVERY_PHONE
  };
}

/**
 * Save updated admin credentials
 */
export async function updateAdminSecurityConfig(
  newEmail: string,
  newPassword?: string,
  newRecoveryPhone?: string
): Promise<void> {
  const current = await getAdminSecurityConfig();
  
  const updated: AdminSecurityConfig = {
    adminEmail: newEmail.trim() || current.adminEmail,
    adminPassword: newPassword?.trim() ? newPassword.trim() : current.adminPassword,
    recoveryPhone: newRecoveryPhone?.trim() ? newRecoveryPhone.trim().replace(/[^0-9]/g, '') : current.recoveryPhone,
    lastPasswordChangedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'settings', 'admin_security'), updated, { merge: true });
  } catch (err) {
    console.warn('Could not save to Firestore, saving to localStorage:', err);
  }

  try {
    localStorage.setItem('cms_admin_security', JSON.stringify(updated));
  } catch (_) {}
}

/**
 * Generate 6-digit recovery OTP and store in Firestore & return WhatsApp dispatch link
 */
export async function createRecoveryOTP(recoveryPhone: string = DEFAULT_RECOVERY_PHONE) {
  const cleanPhone = recoveryPhone.replace(/[^0-9]/g, '') || DEFAULT_RECOVERY_PHONE;
  // Generate random 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Valid for 15 minutes
  const expiresAt = Date.now() + 15 * 60 * 1000;

  try {
    await setDoc(
      doc(db, 'settings', 'admin_security'),
      {
        recoveryOtp: otp,
        recoveryOtpExpiresAt: expiresAt,
        recoveryPhone: cleanPhone
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not set OTP in Firestore, saving local cache:', err);
  }

  try {
    localStorage.setItem('cms_recovery_otp', JSON.stringify({ otp, expiresAt, phone: cleanPhone }));
  } catch (_) {}

  const messageText = `🔐 رمز استرجاع كلمة المرور للوحة تحكم Abu Al-Saud CMS هو:\n\n*${otp}*\n\nالرمز صالح لمدة 15 دقيقة. لا تشاركه مع أي شخص.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  return {
    otp,
    expiresAt,
    phone: cleanPhone,
    whatsappUrl
  };
}

/**
 * Helper to open WhatsApp URL with recovery OTP
 */
export function openWhatsAppWithRecoveryOTP(phone: string, otpData: { whatsappUrl: string } | string) {
  const url = typeof otpData === 'string' 
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`🔐 رمز استرجاع كلمة المرور للوحة تحكم Abu Al-Saud CMS هو:\n\n*${otpData}*\n\nالرمز صالح لمدة 15 دقيقة.`)}`
    : otpData.whatsappUrl;
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Verify OTP and reset password
 */
export async function verifyAndResetPassword(enteredOtp: string, newPassword: string): Promise<boolean> {
  const trimmedOtp = enteredOtp.trim();
  let validOtp: string | undefined;
  let expiresAt: number | undefined;

  try {
    const docSnap = await getDoc(doc(db, 'settings', 'admin_security'));
    if (docSnap.exists()) {
      const data = docSnap.data() as AdminSecurityConfig;
      validOtp = data.recoveryOtp;
      expiresAt = data.recoveryOtpExpiresAt;
    }
  } catch (_) {}

  if (!validOtp) {
    try {
      const local = localStorage.getItem('cms_recovery_otp');
      if (local) {
        const parsed = JSON.parse(local);
        validOtp = parsed.otp;
        expiresAt = parsed.expiresAt;
      }
    } catch (_) {}
  }

  if (!validOtp || validOtp !== trimmedOtp) {
    return false;
  }

  if (expiresAt && Date.now() > expiresAt) {
    return false;
  }

  // OTP is valid! Update password
  const current = await getAdminSecurityConfig();
  const updated: AdminSecurityConfig = {
    ...current,
    adminPassword: newPassword.trim(),
    recoveryOtp: '',
    recoveryOtpExpiresAt: 0,
    lastPasswordChangedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'settings', 'admin_security'), updated, { merge: true });
  } catch (_) {}

  try {
    localStorage.setItem('cms_admin_security', JSON.stringify(updated));
    localStorage.removeItem('cms_recovery_otp');
  } catch (_) {}

  return true;
}

export const verifyRecoveryOTPAndResetPassword = verifyAndResetPassword;

