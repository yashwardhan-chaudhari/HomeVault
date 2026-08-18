import React, { useState, useEffect } from 'react';
import { CodeRunner } from './CodeRunner.jsx';
import { RefreshCw, Play, SkipForward, RotateCcw, Zap, Terminal, Layers, CheckCircle2, HelpCircle, Check, X } from 'lucide-react';

export const EventLoopSection = () => {
  const [activeSubTab, setActiveSubTab] = useState('eventloop');

  // Step-by-step Event Loop Visualizer State
  const steps = [
    {
      stepNumber: 0,
      title: "Initial State (Script Starts)",
      desc: "The JavaScript engine loads the script. Call stack and queues are empty.",
      callStack: ["global()"],
      webApis: [],
      microtasks: [],
      macrotasks: [],
      logs: [],
      currentLine: "console.log('1: Sync Start');"
    },
    {
      stepNumber: 1,
      title: "Executing Synchronous Log 1",
      desc: "console.log('1: Sync Start') enters Call Stack and executes immediately.",
      callStack: ["console.log('1: Sync Start')", "global()"],
      webApis: [],
      microtasks: [],
      macrotasks: [],
      logs: ["1: Sync Start"],
      currentLine: "setTimeout(() => console.log('2: Timeout Task'), 0);"
    },
    {
      stepNumber: 2,
      title: "Registering setTimeout (Macrotask)",
      desc: "setTimeout is a Web API. The browser starts a 0ms timer in the background.",
      callStack: ["setTimeout(cb, 0)", "global()"],
      webApis: ["Timer (0ms) -> '2: Timeout Task'"],
      microtasks: [],
      macrotasks: [],
      logs: ["1: Sync Start"],
      currentLine: "Promise.resolve().then(() => console.log('3: Microtask Promise'));"
    },
    {
      stepNumber: 3,
      title: "Registering Promise.then (Microtask)",
      desc: "Promise resolves immediately. The .then callback is enqueued into the high-priority Microtask Queue.",
      callStack: ["Promise.resolve().then(cb)", "global()"],
      webApis: [],
      microtasks: ["Promise Callback -> '3: Microtask Promise'"],
      macrotasks: ["Timeout Callback -> '2: Timeout Task'"],
      logs: ["1: Sync Start"],
      currentLine: "queueMicrotask(() => console.log('4: queueMicrotask'));"
    },
    {
      stepNumber: 4,
      title: "Registering queueMicrotask",
      desc: "Another microtask is placed into the Microtask Queue.",
      callStack: ["queueMicrotask(cb)", "global()"],
      webApis: [],
      microtasks: [
        "Promise Callback -> '3: Microtask Promise'",
        "Microtask Callback -> '4: queueMicrotask'"
      ],
      macrotasks: ["Timeout Callback -> '2: Timeout Task'"],
      logs: ["1: Sync Start"],
      currentLine: "console.log('5: Sync End');"
    },
    {
      stepNumber: 5,
      title: "Executing Synchronous Log 5",
      desc: "Synchronous execution continues. '5: Sync End' prints.",
      callStack: ["console.log('5: Sync End')", "global()"],
      webApis: [],
      microtasks: [
        "Promise Callback -> '3: Microtask Promise'",
        "Microtask Callback -> '4: queueMicrotask'"
      ],
      macrotasks: ["Timeout Callback -> '2: Timeout Task'"],
      logs: ["1: Sync Start", "5: Sync End"],
      currentLine: "// Main synchronous script finished! Call stack empties."
    },
    {
      stepNumber: 6,
      title: "Main Script Done: Event Loop Flushes Microtasks (Priority 1)",
      desc: "Call stack is empty! The Event Loop MUST drain ALL microtasks before touching macrotasks or re-rendering.",
      callStack: ["cb: '3: Microtask Promise'"],
      webApis: [],
      microtasks: ["Microtask Callback -> '4: queueMicrotask'"],
      macrotasks: ["Timeout Callback -> '2: Timeout Task'"],
      logs: ["1: Sync Start", "5: Sync End", "3: Microtask Promise"],
      currentLine: "// Executing second microtask..."
    },
    {
      stepNumber: 7,
      title: "Flushing Remaining Microtasks",
      desc: "The next microtask is executed from the queue.",
      callStack: ["cb: '4: queueMicrotask'"],
      webApis: [],
      microtasks: [],
      macrotasks: ["Timeout Callback -> '2: Timeout Task'"],
      logs: ["1: Sync Start", "5: Sync End", "3: Microtask Promise", "4: queueMicrotask"],
      currentLine: "// Microtask queue is now empty. Event Loop checks Macrotasks."
    },
    {
      stepNumber: 8,
      title: "Event Loop Picks 1 Macrotask from Task Queue",
      desc: "With microtasks empty, the Event Loop takes the oldest macrotask (setTimeout) and pushes it to Call Stack.",
      callStack: ["cb: '2: Timeout Task'"],
      webApis: [],
      microtasks: [],
      macrotasks: [],
      logs: ["1: Sync Start", "5: Sync End", "3: Microtask Promise", "4: queueMicrotask", "2: Timeout Task"],
      currentLine: "// Complete! Program finished."
    }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = steps[currentStepIndex];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Interactive Prediction Quiz State
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const snippets = {
    eventloop: `// Event Loop Live Playground:
// Run this to verify the exact order in your browser!

console.log('1. Synchronous Stack Frame 1');

setTimeout(() => {
  console.log('4. Macrotask (setTimeout 0ms)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Microtask (Promise.then)');
});

console.log('2. Synchronous Stack Frame 2');`,

    microVsMacro: `// Microtask Starvation Demo:
// Microtasks always run before macrotasks!

setTimeout(() => console.log('🔴 Macrotask Timeout'), 0);

Promise.resolve()
  .then(() => {
    console.log('🟢 Microtask 1');
    return 'chained';
  })
  .then(() => {
    console.log('🟢 Microtask 2 (Chained)');
  });

queueMicrotask(() => {
  console.log('🟢 Microtask 3 (via queueMicrotask)');
});

console.log('⚡ Synchronous Execution');`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-orange-900 to-slate-900 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-400/30">
                Single-Threaded Asynchronous Runtime
              </span>
              <span className="text-xs text-amber-300 font-mono">Microtasks vs Macrotasks</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">JavaScript — Event Loop</h2>
            <p className="text-xs text-amber-200/90 max-w-2xl mt-1 leading-relaxed">
              JavaScript runs on a single main thread. The Event Loop is the engine mechanism that coordinates the Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (Timers/IO) to achieve non-blocking asynchronous concurrency.
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
            <p className="text-[10px] text-amber-200 font-semibold uppercase">Rule of thumb</p>
            <p className="text-sm font-bold">Sync ➔ Micro ➔ Macro</p>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Visualizer */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{step.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isPlaying ? <span className="w-2.5 h-2.5 bg-white rounded-xs"></span> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-40 transition-all"
            >
              Next Step
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
              title="Reset Animation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The 4 Stage Visual Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* 1. Call Stack */}
          <div className="p-4 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-400">1. Call Stack (LIFO)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300">Sync Execution</span>
              </div>
              <div className="space-y-1.5">
                {step.callStack.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic">(Stack Empty)</p>
                ) : (
                  step.callStack.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold truncate animate-fade-in">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-sans mt-2">Executes single frames synchronously</p>
          </div>

          {/* 2. Web APIs / Background */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">2. Browser Web APIs</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Background</span>
              </div>
              <div className="space-y-1.5">
                {step.webApis.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic">(No active timers)</p>
                ) : (
                  step.webApis.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] truncate animate-pulse">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[9px] text-slate-500 font-sans mt-2">Timers, Fetch, DOM events</p>
          </div>

          {/* 3. Microtask Queue (High Priority) */}
          <div className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400">3. Microtask Queue</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">Priority 1</span>
              </div>
              <div className="space-y-1.5">
                {step.microtasks.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic">(Queue Empty)</p>
                ) : (
                  step.microtasks.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold truncate">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[9px] text-emerald-400 font-sans mt-2">Promises, queueMicrotask (Flushed first!)</p>
          </div>

          {/* 4. Macrotask Queue (Normal Priority) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400">4. Task / Macrotask Queue</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">Priority 2</span>
              </div>
              <div className="space-y-1.5">
                {step.macrotasks.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic">(Queue Empty)</p>
                ) : (
                  step.macrotasks.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-200 text-[11px] truncate">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="text-[9px] text-amber-400 font-sans mt-2">setTimeout, setInterval (1 per tick)</p>
          </div>
        </div>

        {/* Live Output Console at current step */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 font-sans font-bold">Live Output Buffer:</span>
            <span className="text-emerald-300 font-bold">
              {step.logs.length === 0 ? '(No output yet)' : step.logs.join('  ➔  ')}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Prediction Riddle */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Frontend Interview Challenge: Predict the Output Order
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs leading-6">
            <p className="text-slate-500">// What will be logged to the console?</p>
            <p>console.log('A');</p>
            <p>setTimeout(() =&gt; console.log('B'), 0);</p>
            <p>Promise.resolve().then(() =&gt; console.log('C'));</p>
            <p>console.log('D');</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Select your predicted log sequence:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {[
                { id: '1', text: 'A ➔ B ➔ C ➔ D' },
                { id: '2', text: 'A ➔ D ➔ C ➔ B' },
                { id: '3', text: 'A ➔ C ➔ D ➔ B' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setQuizAnswer(opt.id);
                    setQuizSubmitted(true);
                  }}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between text-left transition-all ${
                    quizAnswer === opt.id
                      ? opt.id === '2'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{opt.text}</span>
                  {quizAnswer === opt.id && (
                    opt.id === '2' ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />
                  )}
                </button>
              ))}
            </div>

            {quizSubmitted && (
              <div className={`p-3.5 rounded-xl text-xs ${
                quizAnswer === '2'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200'
              }`}>
                <strong>{quizAnswer === '2' ? '🎉 Correct!' : '💡 Explanation:'}</strong>
                <p className="mt-1">
                  1. Synchronous statements <code className="font-mono">A</code> and <code className="font-mono">D</code> execute immediately on the call stack.<br/>
                  2. Microtask <code className="font-mono">C</code> (Promise.then) is drained before any macrotask.<br/>
                  3. Macrotask <code className="font-mono">B</code> (setTimeout) runs last in the next turn!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Runner Sandbox */}
      <CodeRunner
        initialCode={snippets[activeSubTab]}
        title="Event Loop Live Execution Playground"
      />
    </div>
  );
};
