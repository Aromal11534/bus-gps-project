import { create } from 'zustand';
import { BusLocation, BusStop, ETA, getBusLocation, getStops, getETA } from '../services/api';

interface AppState {
  busLocation: BusLocation | null;
  stops: BusStop[];
  etas: ETA[];
  loading: boolean;
  error: string | null;
  selectedBusId: string; // Default or selected bus
  fetchBusLocation: () => Promise<void>;
  fetchStops: () => Promise<void>;
  fetchETA: () => Promise<void>;
  setSelectedBusId: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  busLocation: null,
  stops: [],
  etas: [],
  loading: false,
  error: null,
  selectedBusId: 'BUS-VKCET-001', // Updated to match NodeMCU ID

  fetchBusLocation: async () => {
    const { selectedBusId } = get();
    try {
      const location = await getBusLocation(selectedBusId);
      set({ busLocation: location, error: null });
    } catch (err: any) {
      console.error('Error fetching bus location:', err);
      set({ error: `Location Error: ${err.message}` });
    }
  },

  fetchStops: async () => {
    set({ loading: true });
    try {
      const stops = await getStops();
      set({ stops, loading: false, error: null });
    } catch (err: any) {
      console.error('Error fetching stops:', err);
      set({ error: `Stops Error: ${err.message}`, loading: false });
    }
  },

  fetchETA: async () => {
    const { selectedBusId } = get();
    try {
      const etas = await getETA(selectedBusId);
      set({ etas, error: null });
    } catch (err: any) {
      console.error('Error fetching ETA:', err);
      set({ error: `ETA Error: ${err.message}` });
    }
  },

  setSelectedBusId: (id: string) => set({ selectedBusId: id }),
}));
