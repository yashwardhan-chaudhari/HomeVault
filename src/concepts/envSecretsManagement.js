/**
 * @concept Environment variables & secrets management
 * @category Engineering Practices
 * @description Secure management of runtime secrets, isolation of private keys
 * on the backend server, and safe public client configuration via .env / process.env.
 */

/**
 * Validates and safely retrieves required server environment configuration
 * @returns {Object} Safe sanitized configuration overview
 */
export function getSafeEnvironmentConfig() {
  const isServer = typeof process !== 'undefined' && process.env;

  if (!isServer) {
    // Client-side environment check (only VITE_ prefixed non-sensitive variables)
    return {
      runtime: 'client-browser',
      isProduction: import.meta.env?.PROD || false
    };
  }

  // Server-side validation
  return {
    runtime: 'node-server',
    port: process.env.PORT || 3000,
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}
