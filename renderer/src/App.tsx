import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    vaultmind: {
      getDrives: () => Promise<any[]>;
      scanDrive: (data: { drivePath: string, driveName: string }) => Promise<void>;
      searchFiles: (query: string) => Promise<any[]>;
      getStats: () => Promise<any[]>;
      findDuplicates: () => Promise<any[]>;
      onScanProgress: (callback: (value: any) => void) => void;
    };
  }
}

import { 
  LayoutDashboard, 
  HardDrive, 
  Copy, 
  Zap, 
  Archive, 
  Cloud, 
  FileText, 
  MessageSquare,
  Search,
  Settings,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active ? "bg-white/10 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
    )}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
  </button>
);

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-2 rounded-lg bg-opacity-10", color)}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Live</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-zinc-400">{title}</div>
    {subValue && <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500">{subValue}</div>}
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(true);
  const [stats, setStats] = useState<any>([]);
  const [drives, setDrives] = useState<any>([]);

  useEffect(() => {
    // Initial data fetch
    window.vaultmind.getDrives().then(setDrives);
    window.vaultmind.getStats().then(setStats);
  }, []);

  const data = [
    { name: '2021', size: 4.2 },
    { name: '2022', size: 6.8 },
    { name: '2023', size: 8.4 },
    { name: '2024', size: 2.1 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-4 bg-zinc-950">
        <div className="flex items-center gap-3 px-4 mb-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap size={20} className="text-black fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">VaultMind <span className="text-emerald-500">OS</span></h1>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={HardDrive} label="Drives" active={activeTab === 'drives'} onClick={() => setActiveTab('drives')} />
          <SidebarItem icon={Copy} label="Duplicates" active={activeTab === 'duplicates'} onClick={() => setActiveTab('duplicates')} />
          <SidebarItem icon={Zap} label="Optimization" active={activeTab === 'optimization'} onClick={() => setActiveTab('optimization')} />
          <SidebarItem icon={Archive} label="Archive" active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} />
          <SidebarItem icon={Cloud} label="Cloud" active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} />
        </nav>

        <div className="pt-4 border-t border-white/5 space-y-1">
          <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search 20TB+ across all drives..." 
                className="w-full bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-500">System Healthy</span>
            </div>
            <button 
              onClick={() => setIsAIOpen(!isAIOpen)}
              className={cn(
                "p-2 rounded-full transition-all",
                isAIOpen ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Storage" value="21.4 TB" subValue="Across 4 External Drives" icon={HardDrive} color="bg-blue-500" />
                  <StatCard title="Duplicates Found" value="1.2 TB" subValue="Potential Space Recovery" icon={Copy} color="bg-amber-500" />
                  <StatCard title="Optimization Score" value="84%" subValue="System Health: Excellent" icon={Zap} color="bg-emerald-500" />
                  <StatCard title="Archive Ready" value="4.5 TB" subValue="Projects older than 2 years" icon={Archive} color="bg-purple-500" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-6">Storage Usage by Year (TB)</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '12px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="size" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-6">File Type Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Video', value: 75 },
                              { name: 'RAW', value: 15 },
                              { name: 'Audio', value: 5 },
                              { name: 'Other', value: 5 },
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Activity / Large Files */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Largest Media Assets</h3>
                    <button className="text-xs text-emerald-500 hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { name: 'A001_C002_0101_RAW.mxf', size: '142 GB', drive: 'RED_DRIVE_01', date: '2 hours ago' },
                      { name: 'Project_Final_Master_v4.mov', size: '89 GB', drive: 'SSD_WORK_02', date: 'Yesterday' },
                      { name: 'B_ROLL_INTERVIEW_04.braw', size: '64 GB', drive: 'RED_DRIVE_01', date: '3 days ago' },
                    ].map((file, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <FileText size={18} className="text-zinc-500 group-hover:text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{file.name}</div>
                            <div className="text-xs text-zinc-500">{file.drive} • {file.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-emerald-500">{file.size}</div>
                          <button className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400">Locate</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'drives' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drive Intelligence</h2>
                    <p className="text-zinc-500 mt-1">Manage and index your multi-drive ecosystem.</p>
                  </div>
                  <button className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all">
                    Refresh Mounted Drives
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {drives.map((drive: any, i: number) => (
                    <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex items-center gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <HardDrive size={32} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-bold">{drive.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono">{drive.path}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-zinc-400">{drive.free_space} free of {drive.total_space}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.vaultmind.scanDrive({ drivePath: drive.path, driveName: drive.name })}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all"
                        >
                          Index Drive
                        </button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isAIOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-white/5 bg-zinc-950 flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="font-bold">AI Storage Assistant</h3>
              </div>
              <button onClick={() => setIsAIOpen(false)} className="text-zinc-500 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                <p className="text-sm text-emerald-500 leading-relaxed">
                  "I've analyzed your storage. You have <strong>1.2 TB</strong> of duplicate footage on <strong>RED_DRIVE_01</strong>. 
                  Projects from <strong>2021</strong> are inactive and ready for cloud archival."
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Suggested Queries</h4>
                {[
                  "How much space can I free safely?",
                  "Which projects are inactive?",
                  "Generate storage health report",
                  "Suggest drive redistribution"
                ].map((q, i) => (
                  <button key={i} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask VaultMind..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-black rounded-lg">
                  <Zap size={16} className="fill-current" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
