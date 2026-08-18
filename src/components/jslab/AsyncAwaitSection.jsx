import React, { useState } from 'react';
import { CodeRunner } from './CodeRunner.jsx';
import { Sparkles, Play, Clock, Zap, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export const AsyncAwaitSection = () => {
  const [activeSubTab, setActiveSubTab] = useState('fundamentals');
  const [benchmarkStatus, setBenchmarkStatus] = useState('idle');
  const [benchmarkLogs, setBenchmarkLogs] = useState([]);
  const [seqTime, setSeqTime] = useState(null);
  const [parallelTime, setParallelTime] = useState(null);

  const runBenchmark = async (mode) => {
    setBenchmarkStatus('running');
    const logs = [];
    const log = (msg) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setBenchmarkLogs([...logs]);
    };

    const mockFetch = (id, ms) => new Promise(res => {
      setTimeout(() => {
        log(`✓ Fetched Item #${id} (${ms}ms)`);
        res({ id, name: `Vault Item #${id}`, price: id * 2500 });
      }, ms);
    });

    const start = performance.now();
    try {
      if (mode === 'sequential') {
        log('Starting Sequential Execution (await item1 -> await item2 -> await item3)...');
        await mockFetch(101, 600);
        await mockFetch(102, 600);
        await mockFetch(103, 600);
        const duration = Math.round(performance.now() - start);
        setSeqTime(duration);
        log(`🏁 Total Sequential Time: ${duration}ms (Sum of all delays: ~1800ms)`);
      } else {
        log('Starting Parallel Execution (Promise.all([item1, item2, item3]))...');
        await Promise.all([
          mockFetch(101, 600),
          mockFetch(102, 600),
          mockFetch(103, 600)
        ]);
        const duration = Math.round(performance.now() - start);
        setParallelTime(duration);
        log(`⚡ Total Parallel Time: ${duration}ms (Max delay: ~600ms - 3x faster!)`);
      }
    } catch (e) {
      log(`❌ Error: ${e.message}`);
    } finally {
      setBenchmarkStatus('idle');
    }
  };

  const snippets = {
    fundamentals: `// 1. Fundamentals of async/await
// 'async' functions always return a Promise automatically.
// 'await' pauses execution within the function until the Promise settles.

async function fetchInventoryItem(itemId) {
  console.log(\`Fetching item \${itemId}...\`);
  
  // Simulated asynchronous network request
  const item = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: itemId,
        name: "MacBook Pro M3",
        category: "Electronics",
        location: "Home Office Desk",
        price: 199990
      });
    }, 700);
  });

  console.log("Received item payload:", item.name);
  return item;
}

// Invoking async function
const item = await fetchInventoryItem("VAULT-99");
console.log(\`Item Location: \${item.location} | Price: ₹\${item.price.toLocaleString()}\`);`,

    errorHandling: `// 2. Robust Error Handling with try...catch...finally
// Unlike callbacks, async/await allows synchronous-style error handling!

async function syncVaultCloudBackup(shouldFail = true) {
  console.log("🚀 Starting Cloud Vault Backup Sync...");
  
  try {
    const status = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Network Timeout: 503 Server Unavailable"));
        } else {
          resolve({ status: "SUCCESS", recordsSynced: 42 });
        }
      }, 800);
    });

    console.log("✓ Backup Result:", status);
    return status;
  } catch (error) {
    console.error("❌ Handled Error caught in try/catch:", error.message);
    console.warn("⚠️ Triggering offline local storage fallback...");
    return { fallback: true, cachedCount: 42 };
  } finally {
    console.log("🔒 Finally block executed: Cleaning up network sockets & loaders.");
  }
}

const result = await syncVaultCloudBackup(true);
console.log("Final Pipeline State:", result);`,

    parallelism: `// 3. Sequential vs. Parallel (Promise.all & Promise.allSettled)

async function loadDashboardData() {
  console.log("Fetching User Profile and Inventory concurrently...");

  const fetchUser = () => new Promise(r => setTimeout(() => r({ name: "Alex" }), 500));
  const fetchItems = () => new Promise(r => setTimeout(() => r([ "Camera", "Drone", "Laptop" ]), 500));
  const fetchStats = () => new Promise(r => setTimeout(() => r({ totalValue: 450000 }), 500));

  // PARALLEL EXECUTION: All requests run concurrently
  const startTime = Date.now();
  const [user, items, stats] = await Promise.all([
    fetchUser(),
    fetchItems(),
    fetchStats()
  ]);

  const elapsed = Date.now() - startTime;
  console.log(\`⚡ All 3 requests completed in \${elapsed}ms (instead of 1500ms sequential!)\`);
  console.log("User:", user.name);
  console.log("Items count:", items.length);
  console.log("Total Asset Value: ₹" + stats.totalValue.toLocaleString());
}

await loadDashboardData();`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Frontend Architecture & Concurrency
              </span>
              <span className="text-xs text-indigo-300 font-mono">ES2017 / ES8</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">JavaScript — async / await</h2>
            <p className="text-xs text-indigo-200/90 max-w-2xl mt-1 leading-relaxed">
              Syntactic sugar built on top of Promises and Generators. It allows asynchronous, non-blocking code to be written and structured with the clarity, readability, and error-handling ergonomics of synchronous code.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
              <p className="text-[10px] text-indigo-200 font-semibold uppercase">Mental Model</p>
              <p className="text-sm font-bold">Non-blocking Pause</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. The 'async' Keyword</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Prepended to a function declaration or arrow function. It guarantees the return value will always be implicitly wrapped in a <code className="text-indigo-600 dark:text-indigo-400 font-mono">Promise.resolve()</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. The 'await' Keyword</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Only valid inside <code className="text-indigo-600 dark:text-indigo-400 font-mono">async</code> functions (or top-level modules). Pauses the execution of the async function until the promise settles, without freezing the main thread.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">3. Unified try/catch</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Catches both synchronous runtime errors and asynchronous promise rejections seamlessly in a standard <code className="text-indigo-600 dark:text-indigo-400 font-mono">try...catch...finally</code> block.
          </p>
        </div>
      </div>

      {/* Interactive Visual Benchmark: Sequential vs Parallel */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                Interactive Concurrency Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Experience the difference between sequential awaits vs parallel execution (<code className="text-emerald-400 font-mono">Promise.all</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runBenchmark('sequential')}
              disabled={benchmarkStatus === 'running'}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Run Sequential (Waterfall)
            </button>
            <button
              onClick={() => runBenchmark('parallel')}
              disabled={benchmarkStatus === 'running'}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              Run Parallel (Promise.all)
            </button>
          </div>
        </div>

        {/* Visual Benchmark Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-400">Sequential Execution (Waterfall)</span>
                <span>{seqTime ? `${seqTime}ms` : 'Not run yet'}</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-700"
                  style={{ width: seqTime ? '100%' : '0%' }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                await req1(); await req2(); await req3(); ➔ Total delay = t1 + t2 + t3
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-emerald-400">Parallel Execution (Promise.all)</span>
                <span>{parallelTime ? `${parallelTime}ms` : 'Not run yet'}</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: parallelTime && seqTime ? `${(parallelTime / seqTime) * 100}%` : parallelTime ? '33%' : '0%' }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                await Promise.all([req1(), req2(), req3()]) ➔ Total delay = max(t1, t2, t3)
              </p>
            </div>
          </div>

          {/* Benchmark Terminal Output */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Live Benchmark Logs</p>
            {benchmarkLogs.length === 0 ? (
              <p className="text-slate-600 italic">Click one of the buttons above to benchmark concurrency live.</p>
            ) : (
              benchmarkLogs.map((l, i) => (
                <p key={i} className="py-0.5 text-emerald-300">{l}</p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Code Snippet Tabs & Interactive Playground */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Interactive Code Lab & Patterns
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('fundamentals')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'fundamentals'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Fundamentals
            </button>
            <button
              onClick={() => setActiveSubTab('errorHandling')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'errorHandling'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              try / catch / finally
            </button>
            <button
              onClick={() => setActiveSubTab('parallelism')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'parallelism'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Concurrency & All
            </button>
          </div>
        </div>

        <CodeRunner
          key={activeSubTab}
          initialCode={snippets[activeSubTab]}
          title={`Async / Await — ${activeSubTab.toUpperCase()}`}
        />
      </div>

      {/* Key Takeaways & Best Practices */}
      <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
          Senior Frontend Best Practices
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Avoid Unnecessary Waterfall:</strong> If two requests don't depend on each other's outputs, always fire them concurrently with <code className="font-mono text-indigo-600 dark:text-indigo-400">Promise.all()</code>.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Never omit error handling:</strong> Always wrap in <code className="font-mono text-indigo-600 dark:text-indigo-400">try/catch</code> or provide global boundary fallbacks to avoid uncaught rejection crashes.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>For Loops vs forEach:</strong> <code className="font-mono text-indigo-600 dark:text-indigo-400">for...of</code> respects <code className="font-mono text-indigo-600 dark:text-indigo-400">await</code> sequentially, whereas <code className="font-mono text-indigo-600 dark:text-indigo-400">Array.prototype.forEach()</code> does NOT await async callbacks!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
