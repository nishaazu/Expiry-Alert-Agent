import React from 'react';
import { ScanResult } from '../types';

interface TerminalProps {
  scanResult: ScanResult | null;
  isLoading: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ scanResult, isLoading }) => {
  return (
    <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-700 font-mono text-sm">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-slate-400 text-xs">agent_output.json</span>
      </div>
      <div className="p-4 text-slate-300 h-64 overflow-y-auto scrollbar-hide">
        {isLoading ? (
            <div className="animate-pulse flex flex-col gap-1">
                <span className="text-green-400">$ executing daily_scan...</span>
                <span>Fetching certificates...</span>
                <span>Calculating expiry deltas...</span>
                <span>Connecting to Google Gemini for analysis...</span>
            </div>
        ) : scanResult ? (
          <pre className="whitespace-pre-wrap text-xs md:text-sm text-green-400">
            {JSON.stringify(scanResult, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-500 italic">
            $ system_ready<br/>
            $ waiting for execution command...
          </div>
        )}
      </div>
    </div>
  );
};