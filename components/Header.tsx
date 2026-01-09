
import React from 'react';
import { IconCamera, IconCameraOff, IconShieldLock } from './Icons';

interface HeaderProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMonitoring, onToggleMonitoring }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <IconShieldLock className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
              AI Security Monitor
            </h1>
          </div>
          <button
            onClick={onToggleMonitoring}
            className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 ${
              isMonitoring
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {isMonitoring ? (
              <IconCameraOff className="h-5 w-5 mr-2" />
            ) : (
              <IconCamera className="h-5 w-5 mr-2" />
            )}
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>
    </header>
  );
};
