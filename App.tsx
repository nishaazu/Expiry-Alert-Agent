import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Box, Play, RefreshCw, Database } from 'lucide-react';
import { getMaterials, runDailyScan, resetMockData } from './services/mockDatabase';
import { RawMaterial, ScanResult, Status, DashboardStats } from './types';
import { StatCard } from './components/StatCard';
import { MaterialTable } from './components/MaterialTable';
import { Terminal } from './components/Terminal';
import { SQL_QUERY_PREVIEW } from './constants';

const App: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, safe: 0, warning: 0, expired: 0 });

  const fetchData = async () => {
    const data = await getMaterials();
    setMaterials(data);
    calculateStats(data);
  };

  const calculateStats = (data: RawMaterial[]) => {
    const newStats = data.reduce(
      (acc, curr) => {
        acc.total++;
        if (curr.agent_status === Status.SAFE) acc.safe++;
        else if (curr.agent_status === Status.WARNING) acc.warning++;
        else if (curr.agent_status === Status.EXPIRED) acc.expired++;
        return acc;
      },
      { total: 0, safe: 0, warning: 0, expired: 0 }
    );
    setStats(newStats);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const result = await runDailyScan();
      setScanResult(result);
      // Refresh list to show new statuses
      await fetchData(); 
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = async () => {
      resetMockData();
      setScanResult(null);
      await fetchData();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Hotel Seri Malaysia</h1>
              <p className="text-xs text-emerald-300">Halal Audit System • Autonomous Monitoring Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-emerald-300">Database Connection</span>
                <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ACTIVE (halal_audit_db)
                </span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Top Controls / Agent Interface */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Action Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        Agent Controls
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Execute the daily compliance scan. This will trigger the SQL query engine and the Gemini Analysis Agent to classify risks.
                    </p>
                    
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-4 overflow-hidden">
                        <p className="text-xs font-mono text-slate-500 mb-1">Executing Query:</p>
                        <code className="text-[10px] text-slate-700 block whitespace-pre-wrap">
                            {SQL_QUERY_PREVIEW.slice(0, 150)}...
                        </code>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleRunScan}
                        disabled={isScanning}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium shadow-md transition-all ${isScanning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                    >
                        {isScanning ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Play className="w-5 h-5 fill-current" />}
                        {isScanning ? 'Agent Scanning...' : 'RUN DAILY SCAN'}
                    </button>
                    
                    <button 
                        onClick={handleReset}
                        disabled={isScanning}
                        className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        Reset Simulation Data
                    </button>
                </div>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="lg:col-span-2">
            <Terminal scanResult={scanResult} isLoading={isScanning} />
          </div>
        </section>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Materials" 
            value={stats.total} 
            icon={<Box className="w-6 h-6 text-indigo-600" />} 
            colorClass="bg-indigo-50" 
          />
          <StatCard 
            label="Safe Status" 
            value={stats.safe} 
            icon={<ShieldCheck className="w-6 h-6 text-green-600" />} 
            colorClass="bg-green-50" 
          />
          <StatCard 
            label="Warning / Expiring" 
            value={stats.warning} 
            icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />} 
            colorClass="bg-yellow-50" 
          />
          <StatCard 
            label="Expired" 
            value={stats.expired} 
            icon={<AlertOctagon className="w-6 h-6 text-red-600" />} 
            colorClass="bg-red-50" 
          />
        </section>

        {/* Summary Alert Box (if results exist) */}
        {scanResult && scanResult.summary && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg animate-fade-in">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ShieldCheck className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-indigo-800">Agent Summary</h3>
                        <div className="mt-2 text-sm text-indigo-700">
                            <p>{scanResult.summary}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Material Table */}
        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Live Material Database</h2>
            <MaterialTable materials={materials} />
        </section>
      </main>
    </div>
  );
};

export default App;