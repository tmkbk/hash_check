export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
  duration?: number;
}

type NotificationCallback = (notification: Notification) => void;

class NotificationService {
  private static listeners: NotificationCallback[] = [];

  static subscribe(callback: NotificationCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  static notify(notification: Notification): void {
    this.listeners.forEach((callback) => callback(notification));
  }

  static success(message: string, duration = 3000): void {
    this.notify({ type: 'success', message, duration });
  }

  static error(message: string, duration = 5000): void {
    this.notify({ type: 'error', message, duration });
  }

  static warning(message: string, duration = 4000): void {
    this.notify({ type: 'warning', message, duration });
  }

  static info(message: string, duration = 3000): void {
    this.notify({ type: 'info', message, duration });
  }
}

export default NotificationService;
