import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Partner, PartnerId } from '@types';

interface PartnerStore {
  partners: Partner[];
  isSetupComplete: boolean;

  // Actions
  setPartners: (partners: Partner[]) => void;
  updatePartner: (partner: Partner) => void;
  getPartner: (id: PartnerId) => Partner | undefined;
  getPartners: () => Partner[];
  completeSetup: () => void;
  resetPartners: () => void;
}

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      partners: [],
      isSetupComplete: false,

      setPartners: (partners) =>
        set(() => ({
          partners,
        })),

      updatePartner: (partner) =>
        set((state) => ({
          partners: state.partners.map((p) =>
            p.id === partner.id ? partner : p
          ),
        })),

      getPartner: (id) => {
        const state = get();
        return state.partners.find((p) => p.id === id);
      },

      getPartners: () => get().partners,

      completeSetup: () =>
        set(() => ({
          isSetupComplete: true,
        })),

      resetPartners: () =>
        set(() => ({
          partners: [],
          isSetupComplete: false,
        })),
    }),
    {
      name: 'partner-store',
      version: 1,
    }
  )
);
