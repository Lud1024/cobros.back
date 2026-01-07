const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level) {
  return levels[level] <= levels[LOG_LEVEL];
}

function timeNow() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  info: (...args) => {
    if (shouldLog('info')) console.log('[INFO]', timeNow(), ...args);
  },
  warn: (...args) => {
    if (shouldLog('warn')) console.warn('[WARN]', timeNow(), ...args);
  },
  error: (...args) => {
    if (shouldLog('error')) console.error('[ERROR]', timeNow(), ...args);
  },
  debug: (...args) => {
    if (shouldLog('debug')) console.debug('[DEBUG]', timeNow(), ...args);
  },
  transaction: (...args) => {
    if (shouldLog('info')) console.log('[TRANSACTION]', timeNow(), ...args);
  },
};
