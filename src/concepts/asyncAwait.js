/**
 * @concept JavaScript — async/await
 * @category Frontend
 * @description Implementation of asynchronous programming patterns using async/await,
 * sequential vs parallel execution, and structured error handling with try/catch/finally.
 */

/**
 * Executes a simulated asynchronous network request with async/await
 * @param {string} itemId
 * @param {number} delayMs
 * @returns {Promise<Object>}
 */
export async function fetchItemByIdAsync(itemId, delayMs = 300) {
  try {
    const item = await new Promise((resolve, reject) => {
      if (!itemId) {
        return reject(new Error('Invalid item ID provided to fetchItemByIdAsync'));
      }
      setTimeout(() => {
        resolve({
          id: itemId,
          name: `Vault Item ${itemId}`,
          status: 'STORED',
          timestamp: new Date().toISOString()
        });
      }, delayMs);
    });

    return item;
  } catch (error) {
    console.error(`[async/await] Error fetching item ${itemId}:`, error.message);
    throw error;
  }
}

/**
 * Demonstrates parallel vs sequential execution using async/await & Promise.all
 * @param {string[]} itemIds
 * @returns {Promise<{ items: Object[], elapsedMs: number }>}
 */
export async function fetchMultipleItemsParallel(itemIds = ['1', '2', '3']) {
  const startTime = performance.now();
  
  // Parallel execution using Promise.all
  const items = await Promise.all(
    itemIds.map(id => fetchItemByIdAsync(id, 200))
  );

  const elapsedMs = Math.round(performance.now() - startTime);
  return { items, elapsedMs };
}

/**
 * Demonstrates sequential waterfall execution with async/await
 * @param {string[]} itemIds
 * @returns {Promise<{ items: Object[], elapsedMs: number }>}
 */
export async function fetchMultipleItemsSequential(itemIds = ['1', '2', '3']) {
  const startTime = performance.now();
  const items = [];

  for (const id of itemIds) {
    const item = await fetchItemByIdAsync(id, 200);
    items.push(item);
  }

  const elapsedMs = Math.round(performance.now() - startTime);
  return { items, elapsedMs };
}
