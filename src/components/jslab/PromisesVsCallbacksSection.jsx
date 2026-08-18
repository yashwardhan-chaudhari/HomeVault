import React, { useState } from 'react';
import { CodeRunner } from './CodeRunner.jsx';
import { GitCommit, Split, Zap, AlertTriangle, CheckCircle2, ShieldCheck, Layers, ArrowRight, Play } from 'lucide-react';

export const PromisesVsCallbacksSection = () => {
  const [activeTab, setActiveTab] = useState('promises');
  const [comparisonState, setComparisonState] = useState({
    style: null,
    status: 'idle',
    logs: []
  });

  const runSimulatedPipeline = async (style) => {
    setComparisonState({ style, status: 'running', logs: [`Starting ${style.toUpperCase()} pipeline...`] });

    const addLog = (msg) => {
      setComparisonState(prev => ({
        ...prev,
        logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] ${msg}`]
      }));
    };

    if (style === 'callback') {
      addLog('Step 1: Auth User via callback(user)...');
      setTimeout(() => {
        addLog('✓ User authenticated: Alex');
        addLog('Step 2 (Nested Callback): Fetching Item Vault permissions...');
        setTimeout(() => {
          addLog('✓ Permissions loaded: READ/WRITE');
          addLog('Step 3 (Deep Nested Callback): Fetching Items & Calculating Total...');
          setTimeout(() => {
            addLog('✓ Pipeline Finished via Nested Callbacks (Pyramid of Doom)! Total: ₹4,50,000');
            setComparisonState(prev => ({ ...prev, status: 'completed' }));
          }, 400);
        }, 400);
      }, 400);
    } else if (style === 'promise') {
      addLog('Step 1: authUser().then(...)');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ User authenticated: Alex');
      addLog('Step 2: .then(getPermissions)');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ Permissions loaded: READ/WRITE');
      addLog('Step 3: .then(calculateVaultTotal).catch(handleErr)');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ Promise Chain Fulfilled cleanly! Total: ₹4,50,000');
      setComparisonState(prev => ({ ...prev, status: 'completed' }));
    } else if (style === 'async') {
      addLog('Step 1: const user = await authUser()');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ User authenticated: Alex');
      addLog('Step 2: const perms = await getPermissions(user)');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ Permissions loaded: READ/WRITE');
      addLog('Step 3: const total = await calculateVaultTotal(perms)');
      await new Promise(r => setTimeout(r, 400));
      addLog('✓ Async/Await synchronous-style pipeline finished! Total: ₹4,50,000');
      setComparisonState(prev => ({ ...prev, status: 'completed' }));
    }
  };

  const snippets = {
    callbacks: `// 1. Traditional Callbacks & "Callback Hell" (Pyramid of Doom)
// Issues: Inversion of Control, Nested Error Handling, Unhandled Exceptions

function authenticateUser(userId, onSuccess, onError) {
  setTimeout(() => {
    if (!userId) return onError(new Error("Missing user ID"));
    onSuccess({ id: userId, name: "Alex" });
  }, 300);
}

function fetchUserVault(user, onSuccess, onError) {
  setTimeout(() => {
    onSuccess({ vaultId: "VAULT-1", itemsCount: 3 });
  }, 300);
}

function calculateTotalValue(vault, onSuccess, onError) {
  setTimeout(() => {
    onSuccess(385000);
  }, 300);
}

// Running the nested callback pyramid
console.log("Starting callback chain...");
authenticateUser("USR-99", function(user) {
  console.log("1. User authenticated:", user.name);
  
  fetchUserVault(user, function(vault) {
    console.log("2. Vault retrieved:", vault.vaultId);
    
    calculateTotalValue(vault, function(total) {
      console.log(\`3. Total Vault Value: ₹\${total.toLocaleString()}\`);
    }, function(err) {
      console.error("Calculation Error:", err);
    });
  }, function(err) {
    console.error("Vault Fetch Error:", err);
  });
}, function(err) {
  console.error("Auth Error:", err);
});`,

    promises: `// 2. Modern Promises & Fluent Chaining
// Guarantees: Single resolution, Immutable state, Unified .catch()

function authenticateUser(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) return reject(new Error("Missing user ID"));
      resolve({ id: userId, name: "Alex" });
    }, 300);
  });
}

function fetchUserVault(user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ vaultId: "VAULT-1", items: ["MacBook", "Drone"] });
    }, 300);
  });
}

function calculateTotalValue(vault) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(385000), 300);
  });
}

console.log("Starting Promise Chain...");
authenticateUser("USR-99")
  .then((user) => {
    console.log("1. User authenticated:", user.name);
    return fetchUserVault(user);
  })
  .then((vault) => {
    console.log("2. Vault retrieved:", vault.vaultId);
    return calculateTotalValue(vault);
  })
  .then((total) => {
    console.log(\`3. Total Vault Value: ₹\${total.toLocaleString()}\`);
  })
  .catch((err) => {
    console.error("Centralized Error Handler:", err.message);
  })
  .finally(() => {
    console.log("🔒 Pipeline complete!");
  });`,

    combinators: `// 3. Promise Combinators in Modern JavaScript
// Promise.all, Promise.race, Promise.allSettled, Promise.any

const p1 = new Promise(res => setTimeout(() => res("Fast Item (100ms)"), 100));
const p2 = new Promise((res, rej) => setTimeout(() => res("Safe Item (300ms)"), 300));
const p3 = new Promise(res => setTimeout(() => res("Slow Item (500ms)"), 500));

// 1. Promise.all (Fails fast if any rejects)
const allResults = await Promise.all([p1, p2, p3]);
console.log("Promise.all Result:", allResults);

// 2. Promise.race (First settled wins)
const firstSettled = await Promise.race([p1, p2, p3]);
console.log("Promise.race Winner:", firstSettled);

// 3. Promise.allSettled (Never throws, returns status for all)
const settledReport = await Promise.allSettled([
  Promise.resolve("Success Item"),
  Promise.reject(new Error("Failed Network Sync"))
]);
console.log("Promise.allSettled Audit:", settledReport);`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Asynchronous Evolution & Patterns
              </span>
              <span className="text-xs text-blue-300 font-mono">ES6 Promises vs ES5 Callbacks</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">JavaScript — Promises vs Callbacks</h2>
            <p className="text-xs text-blue-200/90 max-w-2xl mt-1 leading-relaxed">
              Understand the paradigm shift from callback-based concurrency to Promises. Learn how Promises resolve <em>Inversion of Control</em>, eliminate <em>Callback Hell</em>, and provide unified error propagation.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
            <p className="text-[10px] text-blue-200 font-semibold uppercase">Key Advantage</p>
            <p className="text-sm font-bold">Composability & Safety</p>
          </div>
        </div>
      </div>

      {/* Evolution Comparison Matrix */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Architectural Comparison: Callbacks vs Promises vs Async/Await
        </h3>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase">
              <th className="py-2.5 px-3">Feature</th>
              <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400">1. Callbacks (ES5)</th>
              <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400">2. Promises (ES6)</th>
              <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">3. Async/Await (ES8+)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr>
              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">Control Flow</td>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Deep Nesting (Pyramid)</td>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Flat Method Chaining (.then)</td>
              <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300 font-bold">Synchronous-looking linear code</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">Error Handling</td>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Manual per callback (err, data)</td>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Single <code className="font-mono text-blue-600">.catch()</code> at chain end</td>
              <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300 font-bold">Standard <code className="font-mono text-emerald-600">try...catch...finally</code></td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">Inversion of Control</td>
              <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">High Risk (3rd party calls cb)</td>
              <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400">Solved (Returns Promise object)</td>
              <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Solved (Direct value unwrapping)</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">Combinators</td>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">Complex manual counters</td>
              <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-mono">Promise.all, race, allSettled</td>
              <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-mono">await Promise.all([...])</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Interactive Side-by-Side Pipeline Runner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Live Interactive Architecture Pipeline Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click a paradigm to trigger simulated multi-stage async execution and observe how logs and control flow unfold.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runSimulatedPipeline('callback')}
              disabled={comparisonState.status === 'running'}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              Run Callbacks
            </button>
            <button
              onClick={() => runSimulatedPipeline('promise')}
              disabled={comparisonState.status === 'running'}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              Run Promises (.then)
            </button>
            <button
              onClick={() => runSimulatedPipeline('async')}
              disabled={comparisonState.status === 'running'}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              Run Async / Await
            </button>
          </div>
        </div>

        {/* Real-time Output Terminal */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 min-h-[120px] max-h-48 overflow-y-auto">
          {comparisonState.logs.length === 0 ? (
            <p className="text-slate-600 italic">Select one of the three paradigms above to run the live pipeline simulation...</p>
          ) : (
            comparisonState.logs.map((log, idx) => (
              <p key={idx} className="py-0.5 text-blue-200">{log}</p>
            ))
          )}
        </div>
      </div>

      {/* Code Snippet Tabs & Interactive Playground */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Interactive Code Lab & Patterns
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('callbacks')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'callbacks'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Callback Hell
            </button>
            <button
              onClick={() => setActiveTab('promises')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'promises'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Promise Chaining
            </button>
            <button
              onClick={() => setActiveTab('combinators')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'combinators'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Promise Combinators
            </button>
          </div>
        </div>

        <CodeRunner
          key={activeTab}
          initialCode={snippets[activeTab]}
          title={`Promises vs Callbacks — ${activeTab.toUpperCase()}`}
        />
      </div>
    </div>
  );
};
