/**
 * Email Notification Service
 * Dispatches contact messages to admin email (abualss3ud@gmail.com)
 * and persists messages directly to Firestore database.
 */

import { db } from './firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const DEFAULT_ADMIN_EMAIL = 'abualss3ud@gmail.com';

/**
 * Get current configured admin recipient email
 */
export async function getAdminNotificationEmail(): Promise<string> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
    if (settingsDoc.exists() && settingsDoc.data().contactEmail) {
      return settingsDoc.data().contactEmail;
    }
  } catch (_) {}
  return DEFAULT_ADMIN_EMAIL;
}

/**
 * Send contact inquiry to Firestore and dispatch email notification
 */
export async function sendContactMessageAndNotify(payload: ContactMessagePayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const timestamp = new Date().toISOString();
  const recipientEmail = await getAdminNotificationEmail();

  try {
    // 1. Save directly to Firestore 'messages' collection
    const docRef = await addDoc(collection(db, 'messages'), {
      senderName: payload.name.trim(),
      email: payload.email.trim(),
      subject: payload.subject?.trim() || 'New Portfolio Contact Message',
      message: payload.message.trim(),
      read: false,
      createdAt: timestamp,
      deliveredToEmail: recipientEmail,
      status: 'new'
    });

    // 2. Dispatch email notification via Formspree / Mail endpoint
    try {
      await fetch('https://formspree.io/f/mqazqjkg', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _to: recipientEmail,
          _subject: `🔔 New Portfolio Message from ${payload.name}: ${payload.subject || 'Inquiry'}`,
          name: payload.name,
          email: payload.email,
          subject: payload.subject || 'Portfolio Inquiry',
          message: payload.message,
          receivedAt: new Date().toLocaleString('ar-EG'),
          reply_to: payload.email
        })
      });
    } catch (mailErr) {
      console.warn('Third-party email relay warning (message saved to database):', mailErr);
    }

    // 3. Store in local storage for offline / quick fallback
    try {
      const saved = localStorage.getItem('cms_local_messages');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({
        id: docRef.id,
        senderName: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject?.trim() || 'New Message',
        message: payload.message.trim(),
        read: false,
        createdAt: timestamp
      });
      localStorage.setItem('cms_local_messages', JSON.stringify(list));
    } catch (_) {}

    return {
      success: true,
      messageId: docRef.id
    };

  } catch (err: any) {
    console.error('Failed to save contact message to Firestore:', err);

    // Fallback: Save to LocalStorage so data is never lost
    try {
      const localId = `local-msg-${Date.now()}`;
      const saved = localStorage.getItem('cms_local_messages');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({
        id: localId,
        senderName: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject?.trim() || 'New Message',
        message: payload.message.trim(),
        read: false,
        createdAt: timestamp
      });
      localStorage.setItem('cms_local_messages', JSON.stringify(list));

      return {
        success: true,
        messageId: localId
      };
    } catch (storageErr) {
      return {
        success: false,
        error: err.message || 'Failed to submit message'
      };
    }
  }
}
