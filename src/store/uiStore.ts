import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  modalOpen: boolean
  setModalOpen: (open: boolean) => void

  loading: boolean
  setLoading: (loading: boolean) => void

  notification: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  hideNotification: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  notification: null,
  showNotification: (message, type = 'info') => {
    set({
      notification: {
        show: true,
        message,
        type,
      },
    })
    // Auto-hide after 5 seconds
    setTimeout(() => {
      get().hideNotification()
    }, 5000)
  },
  hideNotification: () => set({ notification: null }),
}))
