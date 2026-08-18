import React, { useState } from 'react';
import {
  Code2,
  Zap,
  Lock,
  Clock,
  ArrowUpRight,
  GitCommit,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

import { AsyncAwaitSection } from '../components/jslab/AsyncAwaitSection.jsx';
import { ClosuresSection } from '../components/jslab/ClosuresSection.jsx';
import { EventLoopSection } from '../components/jslab/EventLoopSection.jsx';
import { HoistingSection } from '../components/jslab/HoistingSection.jsx';
import { PromisesVsCallbacksSection } from '../components/jslab/PromisesVsCallbacksSection.jsx';

export const JavaScriptLabPage = () => {
  const [activeConcept, setActiveConcept] = useState('async-await');

  const concepts = [
    {
      id: 'async-await',
      title: 'async / await',
      category: 'Concurrency',
      badge: 'ES2017',
      icon: Zap,
      color: 'indigo',
      desc: 'Syntactic sugar on top of Promises for writing clean, non-blocking asynchronous code.',
      component: AsyncAwaitSection
    },
    {
      id: 'closures',
      title: 'Closures',
      category: 'Scope & Memory',
      badge: 'Core Engine',
      icon: Lock,
      color: 'emerald',
      desc: 'Lexical environment retention, data encapsulation, memoization, and persistent state.',
      component: ClosuresSection
    },
    {
      id: 'event-loop',
      title: 'Event Loop',
      category: 'Runtime Architecture',
      badge: 'Concurrency',
      icon: Clock,
      color: 'amber',
      desc: 'Call Stack, Web APIs, Microtask vs Macrotask queues, and single-threaded execution.',
      component: EventLoopSection
    },
    {
      id: 'hoisting',
      title: 'Hoisting & TDZ',
      category: 'Compilation Phase',
      badge: 'Memory Alloc',
      icon: ArrowUpRight,
      color: 'purple',
      desc: 'Creation Phase vs Execution Phase, var vs let/const, and Temporal Dead Zone mechanics.',
      component: HoistingSection
    },
    {
      id: 'promises-vs-callbacks',
      title: 'Promises vs Callbacks',
      category: 'Async Paradigms',
      badge: 'Evolution',
      icon: GitCommit,
      color: 'blue',
      desc: 'Callback Hell, Inversion of Control, Promise chaining, and concurrency combinators.',
      component: PromisesVsCallbacksSection
    }
  ];

  const currentConcept = concepts.find(c => c.id === activeConcept) || concepts[0];
  const ActiveComponent = currentConcept.component;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Frontend Core Concepts Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            JavaScript Masterclass Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep architectural deep-dives, visual state machines, and interactive sandboxes for essential Frontend JavaScript mechanics.
          </p>
        </div>
      </div>

      {/* Concept Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {concepts.map((concept) => {
          const Icon = concept.icon;
          const isActive = activeConcept === concept.id;
          return (
            <button
              key={concept.id}
              onClick={() => setActiveConcept(concept.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md scale-[1.02]'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {concept.badge}
                  </span>
                </div>
                <h3 className={`text-xs font-bold ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-900 dark:text-slate-100'}`}>
                  {concept.title}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                {concept.category}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Concept Component Content */}
      <div className="mt-4">
        <ActiveComponent />
      </div>
    </div>
  );
};
