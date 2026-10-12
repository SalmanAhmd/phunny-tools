export type ToastKind = 'info' | 'success' | 'error' | 'achievement'

export interface ToastMessage {
  id: string
  title: string
  body?: string
  kind: ToastKind
  emoji?: string
  ttl?: number
}

type Listener = (toasts: ToastMessage[]) => void

class ToastBus {
  private toasts: ToastMessage[] = []
  private listeners = new Set<Listener>()

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.toasts)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private emit() {
    this.listeners.forEach((l) => l(this.toasts))
  }

  push(msg: Omit<ToastMessage, 'id'>): string {
    const id = Math.random().toString(36).slice(2)
    const ttl = msg.ttl ?? (msg.kind === 'achievement' ? 5200 : 3400)
    this.toasts = [...this.toasts, { ...msg, id }].slice(-4)
    this.emit()
    window.setTimeout(() => this.dismiss(id), ttl)
    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.emit()
  }

  clear() {
    this.toasts = []
    this.emit()
  }
}

export const toastBus = new ToastBus()

export const notify = {
  info: (title: string, body?: string, emoji?: string) => toastBus.push({ title, body, kind: 'info', emoji }),
  success: (title: string, body?: string, emoji?: string) =>
    toastBus.push({ title, body, kind: 'success', emoji: emoji ?? '✅' }),
  error: (title: string, body?: string, emoji?: string) =>
    toastBus.push({ title, body, kind: 'error', emoji: emoji ?? '⚠️' }),
  achievement: (title: string, body?: string, emoji?: string) =>
    toastBus.push({ title, body, kind: 'achievement', emoji: emoji ?? '🏆', ttl: 5200 }),
}
