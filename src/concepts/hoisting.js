/**
 * @concept JavaScript — Hoisting
 * @category Frontend
 * @description Demonstrates the JavaScript engine compilation & creation phase,
 * memory allocation for var, let, const, and function declarations vs expressions,
 * including Temporal Dead Zone (TDZ) mechanics.
 */

/**
 * Demonstrates hoisting behaviors and returns execution observations
 * @returns {Object}
 */
export function demonstrateHoistingMechanics() {
  const observations = {};

  // 1. Function Declaration Hoisting: Entire body is hoisted
  observations.functionBeforeDefinition = typeof hoistedFunctionDeclaration === 'function';

  function hoistedFunctionDeclaration() {
    return 'Full function declaration body was hoisted to scope root';
  }

  // 2. var variable hoisting: Variable is hoisted and initialized with undefined
  observations.varBeforeAssignment = typeof hoistedVar; // 'undefined'
  var hoistedVar = 'Assigned value';
  observations.varAfterAssignment = hoistedVar;

  // 3. let & const in Temporal Dead Zone (TDZ):
  // Accessing let/const before declaration statement throws ReferenceError
  let tdzDetected = false;
  try {
    // Testing TDZ within evaluation scope
    const evalTDZ = new Function(`
      try {
        return uninitializedLet;
        let uninitializedLet = "Test";
      } catch(e) {
        return e.name;
      }
    `);
    observations.tdzBehavior = evalTDZ(); // 'ReferenceError'
  } catch (e) {
    observations.tdzBehavior = 'ReferenceError';
  }

  return observations;
}
