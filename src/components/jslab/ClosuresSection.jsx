import React, { useState, useEffect, useRef } from 'react';
import { CodeRunner } from './CodeRunner.jsx';
import { Lock, ShieldCheck, Zap, RefreshCw, Layers, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';

export const ClosuresSection = () => {
  const [activeSubTab, setActiveSubTab] = useState('encapsulation');

  // Interactive Live Closure Demo: Vault Counter
  const [vaultBalance, setVaultBalance] = useState(10000);
  const [lastAction, setLastAction] = useState('Initialized with ₹10,000');
  const [closureHistory, setClosureHistory] = useState([
    { time: '00:00:00', text: 'Closure instance created with private secret state: ₹10,000' }
  ]);

  // Simulated closure in component ref
  const vaultInstanceRef = useRef(null);

  useEffect(() => {
    // Classic closure pattern: private variable inaccessible from global scope
    const createSecureVault = (initialBalance) => {
      let _secretBalance = initialBalance; // Lexically scoped private variable
      let _transactionCount = 0;

      return {
        deposit: (amount) => {
          if (amount <= 0) return { error: 'Invalid amount' };
          _secretBalance += amount;
          _transactionCount++;
          return { success: true, balance: _secretBalance, count: _transactionCount };
        },
        withdraw: (amount) => {
          if (amount > _secretBalance) return { error: 'Insufficient funds' };
          _secretBalance -= amount;
          _transactionCount++;
          return { success: true, balance: _secretBalance, count: _transactionCount };
        },
        getBalance: () => _secretBalance,
        getAudit: () => ({ transactions: _transactionCount })
      };
    };

    vaultInstanceRef.current = createSecureVault(10000);
  }, []);

  const handleDeposit = (val) => {
    if (!vaultInstanceRef.current) return;
    const res = vaultInstanceRef.current.deposit(val);
    setVaultBalance(res.balance);
    setLastAction(`Deposited ₹${val.toLocaleString()}`);
    setClosureHistory(prev => [
      { time: new Date().toLocaleTimeString(), text: `closure.deposit(${val}) ➔ private _secretBalance updated to ₹${res.balance.toLocaleString()}` },
      ...prev.slice(0, 5)
    ]);
  };

  const handleWithdraw = (val) => {
    if (!vaultInstanceRef.current) return;
    const res = vaultInstanceRef.current.withdraw(val);
    if (res.error) {
      setLastAction(`Error: ${res.error}`);
    } else {
      setVaultBalance(res.balance);
      setLastAction(`Withdrew ₹${val.toLocaleString()}`);
      setClosureHistory(prev => [
        { time: new Date().toLocaleTimeString(), text: `closure.withdraw(${val}) ➔ private _secretBalance updated to ₹${res.balance.toLocaleString()}` },
        ...prev.slice(0, 5)
      ]);
    }
  };

  // Debounce interactive simulation
  const [debouncedInput, setDebouncedInput] = useState('');
  const [liveTyping, setLiveTyping] = useState('');
  const [apiCallCount, setApiCallCount] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (liveTyping) {
        setDebouncedInput(liveTyping);
        setApiCallCount(c => c + 1);
      }
    }, 500); // 500ms debounce closure over timeout ID
    return () => clearTimeout(handler);
  }, [liveTyping]);

  const snippets = {
    encapsulation: `// 1. Data Encapsulation & Private Variables via Closures
// The variable '_vaultBalance' is completely hidden from outside mutation.

function createVaultAccount(ownerName, initialBalance) {
  let _vaultBalance = initialBalance; // Private to lexical scope
  let _accessLogs = [];

  function logAccess(action, amount) {
    _accessLogs.push({ action, amount, timestamp: new Date().toLocaleTimeString() });
  }

  return {
    getOwner: () => ownerName,
    deposit: function(amount) {
      if (amount <= 0) throw new Error("Amount must be positive");
      _vaultBalance += amount;
      logAccess("DEPOSIT", amount);
      return \`Successfully deposited ₹\${amount}. New Balance: ₹\${_vaultBalance}\`;
    },
    withdraw: function(amount) {
      if (amount > _vaultBalance) throw new Error("Insufficient vault reserves");
      _vaultBalance -= amount;
      logAccess("WITHDRAW", amount);
      return \`Successfully withdrew ₹\${amount}. Remaining Balance: ₹\${_vaultBalance}\`;
    },
    checkBalance: () => \`Current Protected Balance: ₹\${_vaultBalance}\`,
    getAuditTrail: () => _accessLogs
  };
}

const myVault = createVaultAccount("Alex", 50000);
console.log(myVault.checkBalance());
console.log(myVault.deposit(15000));
console.log(myVault.withdraw(5000));
console.log("Direct _vaultBalance access attempt:", myVault._vaultBalance); // undefined (Safe!)
console.log("Audit Trail:", myVault.getAuditTrail());`,

    memoization: `// 2. Practical Frontend Pattern: Memoization with Closures
// Closures allow caching expensive function computations between calls.

function memoize(fn) {
  const cache = new Map(); // Preserved in closure environment!

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(\`⚡ [Cache Hit] Returning stored result for args: \${key}\`);
      return cache.get(key);
    }

    console.log(\`⏳ [Cache Miss] Computing expensive value for args: \${key}...\`);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Expensive item valuation calculator
const calculateItemDepreciation = memoize((price, years, rate) => {
  return price * Math.pow(1 - rate, years);
});

console.log("Call 1:", calculateItemDepreciation(100000, 3, 0.15));
console.log("Call 2 (Repeated):", calculateItemDepreciation(100000, 3, 0.15)); // Instant cache hit!
console.log("Call 3 (New):", calculateItemDepreciation(50000, 2, 0.10));`,

    loopPitfall: `// 3. Classic Interview Gotcha: Loop Variable Scoping (var vs let)

console.log("--- 1. Using 'var' (Single Shared Binding) ---");
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(\`var loop timeout: i is \${i}\`); // Always prints 3 three times!
  }, 100);
}

// Wait briefly before running the let example
await new Promise(r => setTimeout(r, 200));

console.log("--- 2. Using 'let' (New Lexical Scope Per Iteration) ---");
for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log(\`let loop closure: j is \${j}\`); // Correctly prints 0, 1, 2!
  }, 100);
}`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Core Lexical Environment & Scope
              </span>
              <span className="text-xs text-emerald-300 font-mono">Lexical Scoping</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">JavaScript — Closures</h2>
            <p className="text-xs text-emerald-200/90 max-w-2xl mt-1 leading-relaxed">
              A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). It gives inner functions persistent access to outer scopes even after the outer function has executed and returned.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
            <p className="text-[10px] text-emerald-200 font-semibold uppercase">Key superpower</p>
            <p className="text-sm font-bold">State Persistence</p>
          </div>
        </div>
      </div>

      {/* Visual Mental Model Diagram */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          The Scope Chain & Memory Retention Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              1. Global Scope
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Contains top-level objects (<code className="font-mono text-indigo-600">window</code>, <code className="font-mono text-indigo-600">document</code>, global variables). Lives for application lifecycle.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              2. Outer Lexical Environment
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              Variables declared in parent function (<code className="font-mono">let _privateSecret</code>). Preserved in heap memory because the inner function references them!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
            <div className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              3. Inner Function (The Closure)
            </div>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1">
              The returned callable method. Has access to: [Own Local Scope] ➔ [Parent Lexical Scope] ➔ [Global Scope].
            </p>
          </div>
        </div>
      </div>

      {/* Live Interactive Closure Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Lab 1: Vault State Closure */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Encapsulated State Simulator
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                Private Scope
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white mb-4">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Private Lexical Variable</span>
              <div className="text-3xl font-black text-white mt-1">₹{vaultBalance.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Status: <span className="text-emerald-300 font-mono">{lastAction}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => handleDeposit(2500)}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                + Deposit ₹2,500
              </button>
              <button
                onClick={() => handleWithdraw(1000)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all"
              >
                - Withdraw ₹1,000
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Recent Closure Invocations</span>
            {closureHistory.map((h, idx) => (
              <div key={idx} className="truncate">
                <span className="text-slate-400">[{h.time}]</span> {h.text}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Lab 2: Debounce Closure Visualizer */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Debounce Function (Closure Over Timer ID)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                Frontend Classic
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Type rapidly below. Notice how the internal timer reference is preserved in the closure, resetting with every keystroke until you pause for 500ms.
            </p>

            <input
              type="text"
              value={liveTyping}
              onChange={(e) => setLiveTyping(e.target.value)}
              placeholder="Type fast here to test debounce closure..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 outline-none mb-3 font-medium"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Debounced Value</span>
                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                  {debouncedInput || '(Waiting for input...)'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">API Search Calls Triggered</span>
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {apiCallCount} calls
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Why it works:</strong> The inner event listener holds a reference to <code className="font-mono">let timer</code> from the outer debounce function scope.
          </div>
        </div>
      </div>

      {/* Code Snippet Tabs & Interactive Playground */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Interactive Code Lab & Real-World Use Cases
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('encapsulation')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'encapsulation'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Data Privacy
            </button>
            <button
              onClick={() => setActiveSubTab('memoization')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'memoization'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Memoize Cache
            </button>
            <button
              onClick={() => setActiveSubTab('loopPitfall')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'loopPitfall'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Loop Gotcha (var vs let)
            </button>
          </div>
        </div>

        <CodeRunner
          key={activeSubTab}
          initialCode={snippets[activeSubTab]}
          title={`Closures — ${activeSubTab.toUpperCase()}`}
        />
      </div>

      {/* Best Practices */}
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          Closure Insights & Memory Management
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>React Hook Primitives:</strong> <code className="font-mono text-emerald-600 dark:text-emerald-400">useState</code> and <code className="font-mono text-emerald-600 dark:text-emerald-400">useEffect</code> rely directly on closures to bind component state to fiber nodes across renders.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Memory Leaks Warning:</strong> Since closures retain references to variables in outer scopes, holding on to unused event listeners or heavy objects can prevent garbage collection. Clear intervals and handlers in cleanup functions!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
