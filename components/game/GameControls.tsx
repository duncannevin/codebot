'use client';

import Image from 'next/image';

interface GameControlsProps {
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  isExecuting: boolean;
  speed: number;
}

export default function GameControls({
  onRun,
  onStep,
  onReset,
  onSpeedChange,
  isExecuting,
  speed,
}: GameControlsProps) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-center text-sm font-semibold text-slate-800">
        Execution Controls
      </h3>

      <div className="flex items-center gap-3">
        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={isExecuting}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
        >
          <Image src="/codebot-assets/play.svg" alt="Play" width={20} height={20} />
          Run Code
        </button>

        {/* Step Button */}
        <button
          onClick={onStep}
          disabled={isExecuting}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          <Image src="/codebot-assets/step.svg" alt="Step" width={20} height={20} />
          Step
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={isExecuting}
          className="flex items-center gap-2 rounded-lg bg-slate-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
        >
          <Image src="/codebot-assets/reset.svg" alt="Reset" width={20} height={20} />
          Reset
        </button>

        {/* Speed Control */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-600">Speed:</span>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="h-2 w-24 rounded-lg bg-gray-200"
          />
        </div>
      </div>

      {/* Status Display */}
      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-2">
        <span className={`text-sm ${isExecuting ? 'text-blue-600' : 'text-green-600'}`}>
          ● Status: {isExecuting ? 'Executing...' : 'Ready to execute'}
        </span>
      </div>
    </div>
  );
}

