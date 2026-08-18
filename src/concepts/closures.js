/**
 * @concept JavaScript — Closures
 * @category Frontend
 * @description Implementation of function closures, lexical environment retention,
 * private variable encapsulation, memoization caches, and debounce utilities.
 */

/**
 * Creates an encapsulated state manager utilizing closures for private state
 * @param {number} initialBalance
 * @returns {Object}
 */
export function createEncapsulatedVaultState(initialBalance = 10000) {
  let _privateBalance = initialBalance; // Lexically enclosed private state
  let _transactionLogs = [];

  return {
    deposit: (amount) => {
      if (amount <= 0) throw new Error('Deposit amount must be positive');
      _privateBalance += amount;
      _transactionLogs.push({ type: 'DEPOSIT', amount, date: new Date().toISOString() });
      return _privateBalance;
    },
    withdraw: (amount) => {
      if (amount > _privateBalance) throw new Error('Insufficient vault balance');
      _privateBalance -= amount;
      _transactionLogs.push({ type: 'WITHDRAW', amount, date: new Date().toISOString() });
      return _privateBalance;
    },
    getBalance: () => _privateBalance,
    getAuditLogs: () => [..._transactionLogs]
  };
}

/**
 * Debounce utility using closure over timeout identifier
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function createDebouncedFunction(fn, delay = 300) {
  let timeoutId = null; // Closed-over variable

  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Memoization helper using closure over Map cache
 * @param {Function} fn
 * @returns {Function}
 */
export function memoizeWithClosure(fn) {
  const cache = new Map(); // Lexically retained cache

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
