/**
 * Audio Notification & Desktop Notification Engine
 * Uses Web Audio API for zero-latency, reliable synthesized chimes
 * and HTML5 Notification API for system-level alerts.
 */

// Key for local storage
const SOUND_ENABLED_KEY = 'admin_message_sound_enabled';
const DESKTOP_NOTIFY_KEY = 'admin_desktop_notify_enabled';

/**
 * Check if sound notifications are enabled (default: true)
 */
export function isSoundNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === null ? true : stored === 'true';
}

/**
 * Toggle sound notification preference
 */
export function setSoundNotificationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Synthesize and play a crisp, pleasant high-tech notification chime
 * Uses Web Audio API oscillator nodes for instant playback without external network audio dependencies.
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  if (!isSoundNotificationEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Unlock audio context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First Chime Tone (Note 1 - E5: 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5 glide
    
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second Chime Tone (Note 2 - B5: 987.77 Hz, slightly delayed for crystal resonance)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.28); // E6 glide
    
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.4, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.65);

    // Third Harmonizer Tone (Note 3 - High Shimmer E6: 1318.51 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.51, now + 0.2);
    
    gain3.gain.setValueAtTime(0.001, now);
    gain3.gain.setValueAtTime(0.25, now + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc3.connect(gain3);
    gain3.connect(ctx.destination);

    osc3.start(now + 0.2);
    osc3.stop(now + 0.8);

  } catch (err) {
    console.warn('Web Audio playback failed, ignoring:', err);
  }
}

/**
 * Request permission for Desktop OS-level browser notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem(DESKTOP_NOTIFY_KEY, permission === 'granted' ? 'true' : 'false');
    return permission;
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return 'denied';
  }
}

/**
 * Check if desktop notifications are supported & granted
 */
export function isDesktopNotificationGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Trigger an OS / Desktop System Notification
 */
export function sendDesktopNotification(title: string, body: string, onClick?: () => void): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      badge: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      silent: true // Audio is handled via our custom synthesized chime
    });

    if (onClick) {
      notif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        onClick();
        notif.close();
      };
    }
  } catch (err) {
    console.warn('Desktop notification dispatch error:', err);
  }
}
