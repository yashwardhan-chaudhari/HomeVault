import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react';

export const CodeRunner = ({ initialCode, onCustomRun, title = "Interactive Sandbox" }) => {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setLogs([]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setLogs([]);
    const capturedLogs = [];

    const customConsole = {
      log: (...args) => {
        const text = args.map(a => {
          if (typeof a === 'object') {
            try {
              return JSON.stringify(a, null, 2);
            } catch (e) {
              return String(a);
            }
          }
          return String(a);
        }).join(' ');
        capturedLogs.push({ type: 'log', text, time: new Date().toLocaleTimeString() });
        setLogs([...capturedLogs]);
      },
      warn: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        capturedLogs.push({ type: 'warn', text, time: new Date().toLocaleTimeString() });
        setLogs([...capturedLogs]);
      },
      error: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        capturedLogs.push({ type: 'error', text, time: new Date().toLocaleTimeString() });
        setLogs([...capturedLogs]);
      },
      info: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        capturedLogs.push({ type: 'info', text, time: new Date().toLocaleTimeString() });
        setLogs([...capturedLogs]);
      }
    };

    try {
      if (onCustomRun) {
        await onCustomRun(code, customConsole);
      } else {
        // Safe evaluation wrapping in async function with custom console
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const fn = new AsyncFunction('console', 'queueMicrotask', 'setTimeout', 'setInterval', code);
        await fn(customConsole, window.queueMicrotask.bind(window), window.setTimeout.bind(window), window.setInterval.bind(window));
      }
      if (capturedLogs.length === 0) {
        capturedLogs.push({ type: 'info', text: '✓ Code executed successfully (no console output).', time: new Date().toLocaleTimeString() });
        setLogs([...capturedLogs]);
      }
    } catch (err) {
      capturedLogs.push({ type: 'error', text: `${err.name}: ${err.message}`, time: new Date().toLocaleTimeString() });
      setLogs([...capturedLogs]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-medium">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-slate-400 font-mono ml-2 text-[11px] font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="p-4 bg-slate-900 font-mono text-xs leading-relaxed overflow-x-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={Math.min(18, Math.max(7, code.split('\n').length + 1))}
          className="w-full bg-transparent text-emerald-300 outline-none resize-y font-mono text-[12px] leading-6"
          spellCheck={false}
        />
      </div>

      {/* Console Output Pane */}
      <div className="border-t border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Console Output</span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="text-slate-400 hover:text-slate-200 text-[10px] font-medium"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="space-y-1 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic text-[11px] py-1">Click "Run Code" above to execute this snippet and see output...</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 py-0.5 px-2 rounded ${
                  log.type === 'error'
                    ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                    : log.type === 'warn'
                    ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500'
                    : log.type === 'info'
                    ? 'text-indigo-300'
                    : 'text-slate-200'
                }`}
              >
                <span className="text-slate-500 text-[9px] select-none shrink-0 font-sans">{log.time}</span>
                <span className="text-slate-500 select-none shrink-0">&gt;</span>
                <pre className="whitespace-pre-wrap break-all font-mono">{log.text}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
