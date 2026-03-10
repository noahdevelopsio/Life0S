import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

function applyThemeToDOM(theme: Theme): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
    return systemTheme
  } else {
    root.classList.add(theme)
    return theme
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setTheme: (theme) => {
        const resolved = applyThemeToDOM(theme)
        set({ theme, resolvedTheme: resolved })
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Called AFTER zustand has read from localStorage
        if (state) {
          state.setHasHydrated(true)
          // Apply the persisted theme to the DOM
          const resolved = applyThemeToDOM(state.theme)
          state.resolvedTheme = resolved
        }
      },
    }
  )
)
