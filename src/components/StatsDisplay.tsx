import React from 'react';
import { useStatsStore } from '@/store/statsStore';
import Image from 'next/image';

interface StatsDisplayProps {
  className?: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ className = '' }) => {
  const { connectedUsers, totalMessages, totalDataTransferred } = useStatsStore();

  return (
    <div className={`flex justify-center mx-auto ${className}`}>
      <div className="flex gap-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-2 shadow-lg backdrop-blur-sm border border-gray-700">
        <div className="flex items-center bg-gray-700/50 rounded-lg p-2 transition-all hover:bg-gray-700/50 hover:scale-105">
          <div className="bg-pink-600/20 p-2 rounded-lg">
            <Image src="/svg/icons/users.svg" width={24} height={24} alt="Users" className="text-pink-500" />
          </div>
          <div className="ml-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active</span>
            <span className="text-xl font-bold text-white block">{connectedUsers}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-700/50 rounded-lg p-2 transition-all hover:bg-gray-700/50 hover:scale-105">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <Image src="/svg/icons/messages.svg" width={24} height={24} alt="Messages" className="text-blue-500" />
          </div>
          <div className="ml-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Messages</span>
            <span className="text-xl font-bold text-white block">{totalMessages}</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-700/50 rounded-lg p-2 transition-all hover:bg-gray-700/50 hover:scale-105">
          <div className="bg-purple-600/20 p-2 rounded-lg">
            <Image src="/svg/icons/data.svg" width={24} height={24} alt="Data" className="text-purple-500" />
          </div>
          <div className="ml-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Data</span>
            <span className="text-xl font-bold text-white block">{totalDataTransferred}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;