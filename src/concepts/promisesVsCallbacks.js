/**
 * @concept JavaScript — Promises vs callbacks
 * @category Frontend
 * @description Compares traditional callback-based asynchronous flows (pyramid of doom,
 * inversion of control) with Promise objects (.then/.catch chains) and modern async/await syntax.
 */

/**
 * Traditional error-first callback pattern
 * @param {string} resourceId
 * @param {Function} callback (err, data)
 */
export function fetchWithCallback(resourceId, callback) {
  setTimeout(() => {
    if (!resourceId) {
      return callback(new Error('Resource ID is required'));
    }
    callback(null, { id: resourceId, data: 'Callback Payload' });
  }, 100);
}

/**
 * Converts a traditional callback function into a Promise-based function (Promisify)
 * @param {Function} callbackFn
 * @returns {Function}
 */
export function promisify(callbackFn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      callbackFn(...args, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
}

/**
 * Promise-based asynchronous fetch
 * @param {string} resourceId
 * @returns {Promise<Object>}
 */
export function fetchWithPromise(resourceId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!resourceId) {
        return reject(new Error('Resource ID is required'));
      }
      resolve({ id: resourceId, data: 'Promise Payload' });
    }, 100);
  });
}

/**
 * Demonstrates Promise combinators: Promise.all, Promise.race, Promise.allSettled
 * @returns {Promise<Object>}
 */
export async function demonstratePromiseCombinators() {
  const p1 = new Promise((res) => setTimeout(() => res('P1 Result'), 50));
  const p2 = new Promise((res) => setTimeout(() => res('P2 Result'), 100));
  const p3 = new Promise((res, rej) => setTimeout(() => res('P3 Result'), 150));

  const [allRes, raceRes, settledRes] = await Promise.all([
    Promise.all([p1, p2, p3]),
    Promise.race([p1, p2]),
    Promise.allSettled([p1, p2, Promise.reject(new Error('Rejected test'))])
  ]);

  return { all: allRes, race: raceRes, allSettled: settledRes };
}
