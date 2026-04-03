import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from './firebase';

let messaging: ReturnType<typeof getMessaging> | null = null;

export async function initPushNotifications(userId: string): Promise<boolean> {
  if (!app || !db) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) return false;

    // Save token to Firestore
    await setDoc(doc(db, 'users', userId, 'tokens', 'web'), {
      token,
      updatedAt: new Date().toISOString(),
      platform: 'web',
    });

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      if (payload.notification) {
        new Notification(payload.notification.title || 'Fair Play', {
          body: payload.notification.body,
          icon: '/favicon.svg',
        });
      }
    });

    return true;
  } catch (err) {
    console.error('Push notification setup failed:', err);
    return false;
  }
}
