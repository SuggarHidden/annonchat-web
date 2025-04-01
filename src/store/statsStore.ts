import { create } from 'zustand';

interface StatsState {
  connectedUsers: number;
  totalMessages: number;
  totalDataTransferred: string;
  updateStats: (stats: {
    connectedUsers: number;
    totalMessages: number;
    totalDataTransferred: string;
  }) => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  connectedUsers: 0,
  totalMessages: 0,
  totalDataTransferred: '0 KB',
  updateStats: (stats) => {
    console.log('Updating stats in store:', stats);
    set({
      connectedUsers: stats.connectedUsers,
      totalMessages: stats.totalMessages,
      totalDataTransferred: stats.totalDataTransferred
    });
  },
}));