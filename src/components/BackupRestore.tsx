import React, { useState, useRef } from 'react';
import { 
  Download, Upload, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileJson, Clock, RefreshCw, Layers, Database, ArrowRight, 
  CloudUpload, CloudDownload, Server, Globe, Wifi, WifiOff, X, Activity
} from 'lucide-react';

interface BackupRestoreProps {
  onBackup: () => Promise<void>;
  onRestore: (jsonData: any) => Promise<{ success: boolean; message: string }>;
  loadingData: boolean;
  studentsCount: number;
  activitiesCount: number;
  examsCount: number;
  paymentsCount: number;
}

interface ConnectionStatus {
  connected: boolean;
  databaseType?: string;
  database?: string;
  collections?: string[];
  counts?: Record<string, number>;
  latencyMs?: number;
  error?: string;
  checkedAt?: string;
}

interface ModalNotification {
  title: string;
  type: 'success' | 'error' | 'info';
  message: string;
  sourceDb?: string;
  targetDb?: string;
  summary?: Record<string, number>;
  details?: any;
}

export default function BackupRestore({
  onBackup,
  onRestore,
  loadingData,
  studentsCount,
  activitiesCount,
  examsCount,
  paymentsCount
}: BackupRestoreProps) {
  // Drag & drop file restore states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection check states
  const [checkingLocal, setCheckingLocal] = useState(false);
  const [localStatus, setLocalStatus] = useState<ConnectionStatus | null>(null);

  const [checkingAtlas, setCheckingAtlas] = useState(false);
  const [atlasStatus, setAtlasStatus] = useState<ConnectionStatus | null>(null);

  // Overwrite states
  const [syncingToAtlas, setSyncingToAtlas] = useState(false);
  const [syncingToLocal, setSyncingToLocal] = useState(false);

  // Detailed modal window state
  const [activeModal, setActiveModal] = useState<ModalNotification | null>(null);

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      setParseError("Please select a valid .json backup file.");
      setSelectedFile(null);
      setParsedData(null);
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setRestoreStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!json || typeof json !== 'object') {
          throw new Error("Invalid JSON format. Backup should be an object.");
        }
        if (!Array.isArray(json.students)) {
          throw new Error("Missing 'students' array in backup file.");
        }
        setParsedData(json);
      } catch (err: any) {
        setParseError(`JSON Parse Error: ${err.message}`);
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreClick = async () => {
    if (!parsedData) return;
    const confirmMessage = "⚠️ WARNING: Restoring this backup will overwrite ALL current student profiles, lesson trackings, exams, and payment logs in the system. Are you sure you want to proceed?";
    if (!window.confirm(confirmMessage)) return;

    setRestoring(true);
    setRestoreStatus(null);
    try {
      const response = await onRestore(parsedData);
      if (response.success) {
        setRestoreStatus({
          type: 'success',
          message: response.message || "All records have been successfully restored!"
        });
        setSelectedFile(null);
        setParsedData(null);
      } else {
        setRestoreStatus({
          type: 'error',
          message: response.message || "Failed to restore data."
        });
      }
    } catch (err: any) {
      setRestoreStatus({
        type: 'error',
        message: err.message || "An unexpected error occurred during restoration."
      });
    } finally {
      setRestoring(false);
    }
  };

  // 1. Check Local DB connection button handler
  const handleCheckLocal = async () => {
    setCheckingLocal(true);
    try {
      const res = await fetch('/api/check-local', { cache: 'no-store' });
      const data: ConnectionStatus = await res.json();
      setLocalStatus(data);
      if (data.connected) {
        setActiveModal({
          title: 'Local MongoDB Compass Connected',
          type: 'success',
          message: `Successfully connected to local database "${data.database}" in ${data.latencyMs}ms.`,
          summary: data.counts,
          details: data
        });
      } else {
        setActiveModal({
          title: 'Local Database Connection Failed',
          type: 'error',
          message: data.error || 'Unable to connect to Local MongoDB Compass.',
          details: data
        });
      }
    } catch (err: any) {
      const failStatus: ConnectionStatus = { connected: false, error: err.message };
      setLocalStatus(failStatus);
      setActiveModal({
        title: 'Local DB Connection Error',
        type: 'error',
        message: err.message || 'Network request failed while testing local connection.',
        details: failStatus
      });
    } finally {
      setCheckingLocal(false);
    }
  };

  // 2. Check Global Atlas DB connection button handler
  const handleCheckAtlas = async () => {
    setCheckingAtlas(true);
    try {
      const res = await fetch('/api/check-atlas', { cache: 'no-store' });
      const data: ConnectionStatus = await res.json();
      setAtlasStatus(data);
      if (data.connected) {
        setActiveModal({
          title: 'Global MongoDB Atlas Connected',
          type: 'success',
          message: `Successfully connected to cloud database "${data.database}" in ${data.latencyMs}ms.`,
          summary: data.counts,
          details: data
        });
      } else {
        setActiveModal({
          title: 'Global Atlas Connection Failed',
          type: 'error',
          message: data.error || 'Unable to connect to Global MongoDB Atlas.',
          details: data
        });
      }
    } catch (err: any) {
      const failStatus: ConnectionStatus = { connected: false, error: err.message };
      setAtlasStatus(failStatus);
      setActiveModal({
        title: 'Global Atlas Connection Error',
        type: 'error',
        message: err.message || 'Network request failed while testing Atlas connection.',
        details: failStatus
      });
    } finally {
      setCheckingAtlas(false);
    }
  };

  // 3. Overwrite Global Atlas WITH Local Compass Data (Local ➔ Global)
  const handleSyncToAtlasClick = async () => {
    const confirmMsg =
      "⚠️ OVERWRITE GLOBAL ATLAS WITH LOCAL DATA?\n\n" +
      "This will wipe your cloud MongoDB Atlas database collections and replace them entirely with data from your local MongoDB Compass database.\n\n" +
      "Source (Local): MONGODB_LOCAL_URI\n" +
      "Target (Global): MONGODB_GLOBAL_URI\n\n" +
      "Are you sure you want to proceed?";
    if (!window.confirm(confirmMsg)) return;

    setSyncingToAtlas(true);
    try {
      const res = await fetch('/api/sync-to-atlas', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        setActiveModal({
          title: 'Overwrite Global Atlas Failed',
          type: 'error',
          message: data.error || 'Failed to overwrite Global Atlas database.',
          details: data
        });
      } else {
        setActiveModal({
          title: 'Global Atlas Database Overwritten!',
          type: 'success',
          message: data.message,
          sourceDb: data.sourceDatabase,
          targetDb: data.targetDatabase,
          summary: data.summary,
          details: data
        });
      }
    } catch (err: any) {
      setActiveModal({
        title: 'Overwrite Atlas Error',
        type: 'error',
        message: err.message || 'Network error during Atlas synchronization.'
      });
    } finally {
      setSyncingToAtlas(false);
    }
  };

  // 4. Overwrite Local Compass WITH Global Atlas Data (Global ➔ Local)
  const handleSyncToLocalClick = async () => {
    const confirmMsg =
      "⚠️ OVERWRITE LOCAL COMPASS WITH GLOBAL ATLAS DATA?\n\n" +
      "This will wipe your local MongoDB Compass database collections and replace them entirely with data from your remote MongoDB Atlas database.\n\n" +
      "Source (Global): MONGODB_GLOBAL_URI\n" +
      "Target (Local): MONGODB_LOCAL_URI\n\n" +
      "Are you sure you want to proceed?";
    if (!window.confirm(confirmMsg)) return;

    setSyncingToLocal(true);
    try {
      const res = await fetch('/api/sync-to-local', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        setActiveModal({
          title: 'Overwrite Local Compass Failed',
          type: 'error',
          message: data.error || 'Failed to overwrite Local Compass database.',
          details: data
        });
      } else {
        setActiveModal({
          title: 'Local Compass Database Overwritten!',
          type: 'success',
          message: data.message,
          sourceDb: data.sourceDatabase,
          targetDb: data.targetDatabase,
          summary: data.summary,
          details: data
        });
      }
    } catch (err: any) {
      setActiveModal({
        title: 'Overwrite Local Error',
        type: 'error',
        message: err.message || 'Network error during Local synchronization.'
      });
    } finally {
      setSyncingToLocal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-fadeIn" id="backup-restore-portability-view">
      
      {/* Header Banner - Danger Zone Theme with Max Red/Crimson Gradient Background */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-slate-950 p-6 rounded-2xl border-2 border-red-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-3.5 bg-red-600/30 text-rose-300 rounded-2xl border border-red-500/40 shadow-inner shrink-0">
            <AlertTriangle className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                DANGER ZONE
              </span>
              <span className="text-xs text-rose-300 font-bold font-mono">Critical Operations</span>
            </div>
            <h2 className="text-xl font-display font-black text-white tracking-tight">Database Operations & Synchronization Center</h2>
            <p className="text-xs text-rose-200/80 font-medium mt-0.5">Verify live database connections, download JSON snapshots, or execute high-impact database overwrites.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <span className="text-[11px] font-mono font-bold text-rose-300/80 uppercase tracking-wider">Engine:</span>
          <span className="text-xs bg-red-900/60 text-rose-100 px-3 py-1 rounded-full font-extrabold font-mono border border-red-500/40 shadow-xs">
            MongoDB Dual-Engine
          </span>
        </div>
      </div>

      {/* SECTION 1: Connection Test Controls (2 Buttons for Local and Global DB) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/80 p-6 rounded-2xl border-2 border-red-900/50 shadow-xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-rose-400" />
            <h3 className="font-display font-bold text-white text-base">Database Connection Diagnostics</h3>
          </div>
          <span className="text-[11px] text-rose-300/80 font-semibold font-mono bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-800/40">Live URIs from .env</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Button 1: Check Local DB Connection */}
          <div className="p-5 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 space-y-3 flex flex-col justify-between shadow-lg transition-all hover:border-indigo-400/60">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-white">Local DB (Compass / Antigravity)</span>
                </div>

                {/* Status Badge */}
                {localStatus ? (
                  localStatus.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected ({localStatus.database})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 shadow-xs">
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      Website Host Limit
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
                    Not Checked
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-indigo-200/80 font-mono">
                <span className="truncate">URI: MONGODB_LOCAL_URI</span>
                <span className="shrink-0 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-bold border border-indigo-500/30">
                  Antigravity Ready
                </span>
              </div>

              <p className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-indigo-900/60 leading-tight flex items-start gap-1.5">
                <span className="shrink-0 text-indigo-400 font-bold">💡 Note:</span>
                <span>
                  <strong>MONGODB_LOCAL_URI</strong> is kept intact for your local desktop / Antigravity environment. When viewing on the website host, local 127.0.0.1 is unreachable directly.
                </span>
              </p>
            </div>

            <button
              onClick={handleCheckLocal}
              disabled={checkingLocal}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 border border-indigo-400/30"
            >
              {checkingLocal ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Local Connection...
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Test Local DB Connection
                </>
              )}
            </button>
          </div>

          {/* Button 2: Check Global Atlas DB Connection */}
          <div className="p-5 rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-slate-900 via-violet-950/70 to-slate-950 space-y-3 flex flex-col justify-between shadow-lg transition-all hover:border-violet-400/60">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-xs font-bold text-white">Global DB (Atlas)</span>
                </div>

                {/* Status Badge */}
                {atlasStatus ? (
                  atlasStatus.connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected ({atlasStatus.database})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow-xs">
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      Disconnected
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
                    Not Checked
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px] text-violet-200/80 font-mono">
                <span className="truncate">URI: MONGODB_GLOBAL_URI</span>
                <span className="shrink-0 text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-md font-bold border border-violet-500/30">
                  Cloud Live
                </span>
              </div>

              <p className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-violet-900/60 leading-tight flex items-start gap-1.5">
                <span className="shrink-0 text-violet-400 font-bold">🌐 Note:</span>
                <span>
                  <strong>MONGODB_GLOBAL_URI</strong> is accessible globally across web environments. Always test connection status before performing full sync operations.
                </span>
              </p>
            </div>

            <button
              onClick={handleCheckAtlas}
              disabled={checkingAtlas}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 border border-violet-400/30"
            >
              {checkingAtlas ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  Testing Global Atlas Connection...
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-white" />
                  Test Global DB Connection
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 2: 1-Click Database Overwrite Controls (2 Danger Cards: Local->Global & Global->Local) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Overwrite Card 1: Local Compass -> Global Atlas */}
        <div className="bg-gradient-to-br from-red-950 via-rose-950 to-slate-950 p-6 rounded-2xl border-2 border-red-600/60 shadow-2xl text-white flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-red-600/30 text-rose-300 rounded-xl border border-red-500/40 shadow-xs">
                <CloudUpload className="w-5 h-5 text-rose-300" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-3 py-1 rounded-full shadow-xs border border-red-400">
                Local ➔ Global
              </span>
            </div>

            <div>
              <h3 className="font-display font-black text-white text-lg tracking-tight">Overwrite Global Atlas</h3>
              <p className="text-xs text-rose-200/90 leading-relaxed mt-1">
                Wipes all collections on <code className="text-rose-200 bg-red-900/80 px-1 rounded font-mono">MONGODB_GLOBAL_URI</code> and replaces them with live data from your local Compass database (<code className="text-rose-200 bg-red-900/80 px-1 rounded font-mono">MONGODB_LOCAL_URI</code>).
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-red-900/60 text-[11px] space-y-1.5 font-mono text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-bold text-indigo-400">Local Compass</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target (Wiped):</span>
                <span className="font-bold text-rose-400">MongoDB Atlas</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncToAtlasClick}
            disabled={syncingToAtlas}
            className="w-full py-3 px-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-950/80 cursor-pointer border border-red-400/40 active:scale-98 text-center"
          >
            {syncingToAtlas ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Overwriting Global Atlas...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-4 h-4 shrink-0" />
                <span>Overwrite Global with Local</span>
              </>
            )}
          </button>
        </div>

        {/* Overwrite Card 2: Global Atlas -> Local Compass */}
        <div className="bg-gradient-to-br from-amber-950 via-red-950 to-slate-950 p-6 rounded-2xl border-2 border-amber-600/60 shadow-2xl text-white flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-600/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-amber-600/30 text-amber-300 rounded-xl border border-amber-500/40 shadow-xs">
                <CloudDownload className="w-5 h-5 text-amber-300" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white px-3 py-1 rounded-full shadow-xs border border-amber-400">
                Global ➔ Local
              </span>
            </div>

            <div>
              <h3 className="font-display font-black text-white text-lg tracking-tight">Overwrite Local Compass</h3>
              <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
                Wipes all collections on <code className="text-amber-200 bg-amber-900/80 px-1 rounded font-mono">MONGODB_LOCAL_URI</code> and replaces them with cloud data fetched from MongoDB Atlas (<code className="text-amber-200 bg-amber-900/80 px-1 rounded font-mono">MONGODB_GLOBAL_URI</code>).
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/60 text-[11px] space-y-1.5 font-mono text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="font-bold text-violet-400">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target (Wiped):</span>
                <span className="font-bold text-amber-400">Local Compass</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncToLocalClick}
            disabled={syncingToLocal}
            className="w-full py-3 px-3 bg-gradient-to-r from-amber-600 via-red-600 to-rose-700 hover:from-amber-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-950/80 cursor-pointer border border-amber-400/40 active:scale-98 text-center"
          >
            {syncingToLocal ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Overwriting Local Compass...</span>
              </>
            ) : (
              <>
                <CloudDownload className="w-4 h-4 shrink-0" />
                <span>Overwrite Local with Global</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* SECTION 3: JSON File Backup & Restore Panels with Maximum Component Background Coloring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Create Backup */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 rounded-2xl border-2 border-indigo-500/40 shadow-xl flex flex-col justify-between space-y-6 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <Download className="w-4 h-4 text-indigo-300" />
              </span>
              <h3 className="font-display font-bold text-white text-base">Download Local Backup File</h3>
            </div>
            
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Export an offline JSON backup containing all current student records, activity tracking, logs, and financial transactions.
            </p>

            <div className="bg-indigo-950/80 p-4 rounded-xl border border-indigo-800/80 space-y-3">
              <span className="text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider block">Current Ledger Snapshot</span>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-indigo-900/60">
                  <span className="text-indigo-300/80">Students:</span>
                  <span className="font-bold text-white">{studentsCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-indigo-900/60">
                  <span className="text-indigo-300/80">Lessons:</span>
                  <span className="font-bold text-white">{activitiesCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-indigo-900/60">
                  <span className="text-indigo-300/80">Exams:</span>
                  <span className="font-bold text-white">{examsCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-indigo-900/60">
                  <span className="text-indigo-300/80">Payments:</span>
                  <span className="font-bold text-white">{paymentsCount}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onBackup}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-950/80 cursor-pointer border border-indigo-400/30"
          >
            <Download className="w-4 h-4" />
            Generate JSON Backup File
          </button>
        </div>

        {/* Panel 2: Restore Backup (Critical Danger Component) */}
        <div className="bg-gradient-to-br from-rose-950 via-red-950 to-slate-950 p-6 rounded-2xl border-2 border-rose-500/50 shadow-2xl flex flex-col justify-between space-y-6 text-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-rose-600/30 text-rose-300 rounded-xl border border-rose-500/40">
                <Upload className="w-4 h-4 text-rose-300" />
              </span>
              <h3 className="font-display font-bold text-white text-base">Upload & Restore JSON Backup</h3>
            </div>
            
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Restore full database state using an exported <code className="bg-red-900/80 px-1 py-0.5 rounded font-mono text-rose-200">.json</code> snapshot file.
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-rose-400 bg-rose-900/60' 
                  : selectedFile 
                    ? 'border-emerald-400 bg-emerald-950/60' 
                    : 'border-rose-800/80 bg-rose-950/40 hover:border-rose-500 hover:bg-rose-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleChange}
                className="hidden"
              />
              
              <div className="space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-slate-900 border border-rose-700/50 flex items-center justify-center text-rose-300">
                  {selectedFile ? (
                    <FileJson className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Upload className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="text-xs text-rose-200 font-medium">
                  {selectedFile ? (
                    <span className="text-emerald-300 font-bold block truncate max-w-xs mx-auto font-mono">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <span>Drag & drop JSON file or <span className="text-rose-300 underline font-bold">browse</span></span>
                  )}
                </div>
              </div>
            </div>

            {parsedData && (
              <div className="bg-emerald-950/90 p-4 rounded-xl border border-emerald-500/50 space-y-1 animate-fadeIn text-xs text-emerald-200 font-mono">
                <div className="font-bold text-emerald-300">Verified Snapshot Contents:</div>
                <div>• {parsedData.students?.length || 0} Students</div>
                <div>• {parsedData.activities?.length || 0} Lessons</div>
                <div>• {parsedData.exams?.length || 0} Exams</div>
                <div>• {parsedData.payments?.length || 0} Payments</div>
              </div>
            )}

            {parseError && (
              <div className="bg-rose-900/90 p-4 rounded-xl border border-rose-500/60 text-rose-100 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleRestoreClick}
            disabled={!parsedData || restoring}
            className="w-full py-3.5 disabled:opacity-40 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-950/90 cursor-pointer border border-rose-400/40"
          >
            {restoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Restoring Database...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Overwrite & Restore File Snapshot
              </>
            )}
          </button>
        </div>

      </div>

      {/* Safety Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-900 p-5 rounded-2xl border-2 border-red-500/50 space-y-2 flex items-start gap-3.5 text-red-100 shadow-xl">
        <ShieldCheck className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            Database Security & Integrity Protocol
          </h4>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            All overwrite operations replace entire collection datasets atomically. Always verify connections using the test diagnostic buttons above prior to performing global or local database overwrites.
          </p>
        </div>
      </div>

      {/* SECTION 4: Detailed Notification Window / Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 transform transition-all scale-100 my-auto max-h-[90vh] sm:max-h-[85vh] flex flex-col">
            
            {/* Modal Header Bar with Color Accent */}
            <div className={`p-5 flex items-center justify-between border-b ${
              activeModal.type === 'success'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                : activeModal.type === 'error'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  {activeModal.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : activeModal.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-white" />
                  ) : (
                    <Activity className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">{activeModal.title}</h3>
                  <p className="text-[11px] text-white/80 font-mono">Detailed Operation Outcome Report</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-5 text-slate-800">
              
              {/* Message text */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed font-medium ${
                activeModal.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : activeModal.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}>
                {activeModal.message}
              </div>

              {/* Source & Target Database Tags */}
              {(activeModal.sourceDb || activeModal.targetDb) && (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {activeModal.sourceDb && (
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Source Database</span>
                      <span className="font-bold text-slate-800">{activeModal.sourceDb}</span>
                    </div>
                  )}
                  {activeModal.targetDb && (
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Target Database</span>
                      <span className="font-bold text-slate-800">{activeModal.targetDb}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Synchronized Collections & Document Breakdown */}
              {activeModal.summary && Object.keys(activeModal.summary).length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Collection Document Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                    {Object.entries(activeModal.summary).map(([col, count]) => (
                      <div key={col} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <span className="text-slate-500 text-[11px]">{col}</span>
                        <span className="font-extrabold text-indigo-600 text-sm">{count} docs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical JSON Details */}
              {activeModal.details && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Raw Connection Payload
                  </span>
                  <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                    {JSON.stringify(activeModal.details, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
