import React, { useState } from 'react';
import { CodeRunner } from './CodeRunner.jsx';
import { ArrowUpRight, AlertOctagon, CheckCircle2, Cpu, Eye, Split, Layers, HelpCircle } from 'lucide-react';

export const HoistingSection = () => {
  const [selectedScenario, setSelectedScenario] = useState('varVsLet');

  const scenarios = {
    varVsLet: {
      title: "var vs let & const (Temporal Dead Zone - TDZ)",
      description: "var is hoisted and initialized as 'undefined'. let/const are hoisted into block scope but cannot be accessed before initialization (TDZ).",
      writtenCode: `console.log(myVar);  // Output: undefined (No error!)
var myVar = "HomeVault Item";

try {
  console.log(myLet); // Throws ReferenceError!
  let myLet = "Smart Safe";
} catch(e) {
  console.error("TDZ Error:", e.message);
}`,
      engineInterpretation: `// --- Phase 1: Creation / Memory Allocation Phase ---
var myVar = undefined; // Initialized to undefined in scope
let myLet;             // Allocated in TDZ (UNINITIALIZED)

// --- Phase 2: Execution Phase ---
console.log(myVar);    // Reads 'undefined'
myVar = "HomeVault Item";

// Attempting to read myLet while in TDZ triggers ReferenceError!
myLet = "Smart Safe";  // Initialized now`
    },

    functionsVsExpressions: {
      title: "Function Declarations vs Function Expressions",
      description: "Function declarations are completely hoisted with their full implementation body. Function expressions assigned to variables only hoist the variable name.",
      writtenCode: `// 1. Invoking function declaration BEFORE definition works!
console.log(calculateDepreciation(10000)); 

function calculateDepreciation(price) {
  return price * 0.9;
}

// 2. Invoking function expression / arrow function BEFORE assignment fails!
try {
  console.log(calculateTax(10000));
  var calculateTax = (price) => price * 0.18;
} catch(e) {
  console.error("Expression Error:", e.name, e.message);
  // TypeError: calculateTax is not a function (it is currently undefined!)
}`,
      engineInterpretation: `// --- Phase 1: Creation Phase ---
function calculateDepreciation(price) { ... } // FULL BODY HOISTED!
var calculateTax = undefined;                // Only variable name hoisted!

// --- Phase 2: Execution Phase ---
calculateDepreciation(10000); // SUCCESS! Function exists in memory.
calculateTax(10000);         // ERROR! undefined(10000) throws TypeError!`
    },

    precedence: {
      title: "Hoisting Precedence: Functions vs Variables",
      description: "Function declarations take precedence over variable declarations with the same identifier name in the creation phase.",
      writtenCode: `console.log("Type of vaultKey:", typeof vaultKey); // function!

var vaultKey = "SECRET_123";

function vaultKey() {
  return "VAULT_OPEN";
}

console.log("After assignment:", typeof vaultKey, vaultKey); // string "SECRET_123"`,
      engineInterpretation: `// --- Phase 1: Creation Phase ---
function vaultKey() { ... } // Function declaration assigned first
// 'var vaultKey' is ignored because identifier already bound to function!

// --- Phase 2: Execution Phase ---
typeof vaultKey; // 'function'
vaultKey = "SECRET_123"; // Reassigned to string!
typeof vaultKey; // 'string'`
    }
  };

  const current = scenarios[selectedScenario];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
                Engine Compilation & Memory Allocation
              </span>
              <span className="text-xs text-purple-300 font-mono">Creation vs Execution Phase</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">JavaScript — Hoisting & TDZ</h2>
            <p className="text-xs text-purple-200/90 max-w-2xl mt-1 leading-relaxed">
              Hoisting is the JavaScript engine's behavior of allocating memory for variable and function declarations in the <strong>Creation Phase</strong> before line-by-line execution begins.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
            <p className="text-[10px] text-purple-200 font-semibold uppercase">Mental Model</p>
            <p className="text-sm font-bold">Memory First, Run Second</p>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">var</span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-1">Hoisted + Initialized</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
            Initialized to <code className="font-mono text-purple-600">undefined</code>. Accessing before declaration returns <code className="font-mono">undefined</code>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">let & const</span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-1">Hoisted in TDZ</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
            Hoisted into block scope but UNINITIALIZED. Accessing before declaration throws <code className="font-mono text-rose-500">ReferenceError</code>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">function foo()</span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-1">Fully Hoisted</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
            Function declarations hoist the entire function body. Can safely be called anywhere in its containing scope.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">var fn = () =&gt; {}</span>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mt-1">Variable Only</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] leading-relaxed">
            Only the variable name is hoisted with <code className="font-mono">undefined</code>. Early invocation throws <code className="font-mono text-amber-600">TypeError</code>.
          </p>
        </div>
      </div>

      {/* Interactive Engine Disassembler */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                JS Engine Memory Disassembler
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a scenario to view how the engine rearranges memory during Creation vs Execution phases.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSelectedScenario('varVsLet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedScenario === 'varVsLet' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              var vs let (TDZ)
            </button>
            <button
              onClick={() => setSelectedScenario('functionsVsExpressions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedScenario === 'functionsVsExpressions' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Functions vs Expressions
            </button>
            <button
              onClick={() => setSelectedScenario('precedence')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedScenario === 'precedence' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Precedence
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Written Code */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>How You Wrote It</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Source Code</span>
            </div>
            <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {current.writtenCode}
            </pre>
          </div>

          {/* Right: Engine Mental Model */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-purple-400">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>How the JS Engine Evaluates It</span>
              </div>
              <span className="text-[10px] text-purple-400/80 font-mono">Memory Allocation</span>
            </div>
            <pre className="font-mono text-xs text-purple-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {current.engineInterpretation}
            </pre>
          </div>
        </div>
      </div>

      {/* Code Runner Sandbox */}
      <CodeRunner
        key={selectedScenario}
        initialCode={current.writtenCode}
        title={`Hoisting Live Sandbox — ${current.title}`}
      />
    </div>
  );
};
