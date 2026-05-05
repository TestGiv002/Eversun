import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Section } from '@/types/client';

/**
 * Interface du store Zustand pour l'état global de l'application
 */
interface AppStore {
  /** Section actuellement active dans la sidebar */
  activeSection: Section;
  /** Définit la section active */
  setActiveSection: (section: Section) => void;
  /** État d'ouverture de la sidebar */
  sidebarOpen: boolean;
  /** Bascule l'état de la sidebar */
  toggleSidebar: () => void;
  /** Définit l'état de la sidebar */
  setSidebarOpen: (open: boolean) => void;
  /** Thème actuel de l'application */
  theme: 'light' | 'dark';
  /** Bascule entre les thèmes light et dark */
  toggleTheme: () => void;
  /** Définit le thème de l'application */
  setTheme: (theme: 'light' | 'dark') => void;
  /** Comptes de clients par section */
  sectionCounts: Record<string, number>;
  /** Définit les comptes de clients par section */
  setSectionCounts: (counts: Record<string, number>) => void;
  /** Notifications */
  notifications: Array<{ id: string; message: string; timestamp: Date }>;
  /** Ajoute une notification */
  addNotification: (message: string) => void;
  /** Supprime une notification */
  removeNotification: (id: string) => void;
  /** Vide toutes les notifications */
  clearNotifications: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeSection: 'dp-en-cours',
      setActiveSection: (section) => set({ activeSection: section }),
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      sectionCounts: {
        'clients': 0,
        'dp-en-cours': 0,
        'dp-accordes': 0,
        'dp-refuses': 0,
        'daact': 0,
        'installation': 0,
        'consuel-en-cours': 0,
        'consuel-finalise': 0,
        'raccordement': 0,
        'raccordement-mes': 0,
        'parameters': 0,
        'sunlib': 0,
        'otovo': 0,
      },
      setSectionCounts: (counts) =>
        set((state) => ({ sectionCounts: { ...state.sectionCounts, ...counts } })),
      notifications: [],
      addNotification: (message) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { id: Date.now().toString(), message, timestamp: new Date() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
