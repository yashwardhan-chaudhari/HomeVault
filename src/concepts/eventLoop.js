/**
 * @concept JavaScript — Event loop
 * @category Frontend
 * @description Implementation demonstrating the JavaScript single-threaded concurrency model,
 * Call Stack, Web APIs, Microtask Queue (Promises, queueMicrotask), and Macrotask Queue (Timers).
 */

/**
 * Demonstrates the exact Event Loop execution order:
 * Synchronous Stack -> Microtask Queue -> Macrotask Queue
 * @param {Function} logger
 * @returns {Promise<string[]>}
 */
export function runEventLoopSimulation(logger = console.log) {
  return new Promise((resolve) => {
    const executionOrder = [];

    const record = (msg) => {
      executionOrder.push(msg);
      logger(msg);
    };

    // 1. Synchronous execution on the Call Stack
    record('1: Synchronous Call Stack Frame A');

    // 2. Macrotask (Task Queue) via setTimeout
    setTimeout(() => {
      record('4: Macrotask from Task Queue (setTimeout 0ms)');
      resolve(executionOrder);
    }, 0);

    // 3. Microtask Queue via Promise.then
    Promise.resolve().then(() => {
      record('3: Microtask from Promise.then (High Priority)');
    });

    // 3.5 Microtask Queue via queueMicrotask
    queueMicrotask(() => {
      record('3.5: Microtask from queueMicrotask');
    });

    // 1. Synchronous execution continues on Call Stack
    record('2: Synchronous Call Stack Frame B');
  });
}
