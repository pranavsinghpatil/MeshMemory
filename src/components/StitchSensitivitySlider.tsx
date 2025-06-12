import React, { useState, useEffect } from 'react';
import { Sliders, Info } from 'lucide-react';
import Tooltip from './Tooltip';

interface StitchSensitivitySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function StitchSensitivitySlider({
  value,
  onChange,
  className = ''
}: StitchSensitivitySliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const getSensitivityLabel = (val: number) => {
    if (val <= 0.3) return 'Very Loose';
    if (val <= 0.5) return 'Loose';
    if (val <= 0.7) return 'Balanced';
    if (val <= 0.85) return 'Strict';
    return 'Very Strict';
  };

  const getSensitivityDescription = (val: number) => {
    if (val <= 0.3) return 'Groups very different conversations together';
    if (val <= 0.5) return 'Groups somewhat related conversations';
    if (val <= 0.7) return 'Groups clearly related conversations (recommended)';
    if (val <= 0.85) return 'Only groups very similar conversations';
    return 'Only groups nearly identical conversations';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Thread Stitching Sensitivity
          </label>
          <Tooltip
            content={
              <div className="max-w-xs">
                <p className="font-medium mb-2">Thread Stitching Sensitivity</p>
                <p className="text-xs">
                  Controls how similar conversations need to be to get grouped into the same thread. 
                  Higher values create more focused threads, lower values create broader threads.
                </p>
              </div>
            }
            position="top"
          >
            <Info className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
          </Tooltip>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {getSensitivityLabel(localValue)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {(localValue * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.05"
            value={localValue}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #f59e0b 25%, #10b981 50%, #3b82f6 75%, #8b5cf6 100%)`
            }}
          />
          
          {/* Slider track with gradient */}
          <div className="absolute top-0 left-0 h-2 rounded-lg pointer-events-none"
               style={{
                 width: `${(localValue - 0.1) / (0.95 - 0.1) * 100}%`,
                 background: 'linear-gradient(to right, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)'
               }}>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Loose</span>
          <span>Balanced</span>
          <span>Strict</span>
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getSensitivityDescription(localValue)}
        </p>
      </div>
    </div>
  );
}