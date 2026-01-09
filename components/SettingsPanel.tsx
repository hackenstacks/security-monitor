
import React from 'react';
import type { Settings } from '../types';
import { IconMotionSensor, IconSound, IconTimer, IconGoogleDrive, IconSync } from './Icons';

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: React.Dispatch<React.SetStateAction<Settings>>;
  disabled: boolean;
}

const SettingSlider: React.FC<{
    id: keyof Settings;
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (id: keyof Settings, value: number) => void;
    disabled: boolean;
    icon: React.ReactNode;
}> = ({ id, label, value, min, max, step, unit, onChange, disabled, icon }) => {
    return (
        <div className="space-y-3 p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="flex items-center text-sm font-semibold text-gray-300">
                    {icon}
                    <span>{label}</span>
                </label>
                <span className="text-sm font-mono font-bold bg-cyan-900/40 text-cyan-300 rounded-lg px-3 py-1 min-w-[60px] text-center border border-cyan-500/30">
                    {value}{unit || ''}
                </span>
            </div>
            <div className="flex items-center space-x-4">
                <input
                    type="range"
                    id={id}
                    name={id}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(id, parseInt(e.target.value, 10))}
                    disabled={disabled}
                    className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-cyan-500 hover:accent-cyan-400 transition-all"
                />
            </div>
        </div>
    );
};


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled }) => {
  const handleChange = (id: keyof Settings, value: number | boolean) => {
    onSettingsChange(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className={`bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700 transition-all duration-300 ${disabled ? 'ring-1 ring-yellow-500/20' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100">System Configuration</h2>
        {disabled && (
            <div className="flex items-center text-xs font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                Monitoring Active
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingSlider
                id="motionSensitivity"
                label="Visual Threshold"
                value={settings.motionSensitivity}
                min={1}
                max={100}
                step={1}
                onChange={handleChange as any}
                disabled={disabled}
                icon={<IconMotionSensor className="h-5 w-5 mr-3 text-cyan-400" />}
            />
            <SettingSlider
                id="soundSensitivity"
                label="Acoustic Sensitivity"
                value={settings.soundSensitivity}
                min={1}
                max={100}
                step={1}
                onChange={handleChange as any}
                disabled={disabled}
                icon={<IconSound className="h-5 w-5 mr-3 text-cyan-400" />}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingSlider
                id="recordingDuration"
                label="Capture Window"
                value={settings.recordingDuration}
                min={5}
                max={300}
                step={5}
                unit="s"
                onChange={handleChange as any}
                disabled={disabled}
                icon={<IconTimer className="h-5 w-5 mr-3 text-cyan-400" />}
            />

            <div className="p-4 bg-gray-900/40 rounded-xl border border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center">
                    <IconSync className="h-5 w-5 mr-3 text-emerald-400" />
                    <div>
                        <p className="text-sm font-semibold text-gray-300">Auto Cloud Sync</p>
                        <p className="text-[10px] text-gray-500">Auto-upload to Google Drive</p>
                    </div>
                </div>
                <button
                    onClick={() => handleChange('autoSync', !settings.autoSync)}
                    disabled={disabled}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.autoSync ? 'bg-emerald-600' : 'bg-gray-700'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.autoSync ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
