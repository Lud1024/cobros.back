const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
const REMOTE_LOG_ENABLED = process.env.REMOTE_LOG_ENABLED === 'true';

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

// Enviar log a Discord webhook
async function sendToDiscord(level, message, data = null) {
  if (!REMOTE_LOG_ENABLED || !DISCORD_WEBHOOK) return;
  
  // Solo enviar errores y warnings a Discord para no saturar
  if (level !== 'error' && level !== 'warn') return;
  
  try {
    const emoji = level === 'error' ? '🔴' : level === 'warn' ? '🟡' : '🔵';
    const color = level === 'error' ? 0xFF0000 : level === 'warn' ? 0xFFFF00 : 0x0099FF;
    
    const embed = {
      title: `${emoji} [${level.toUpperCase()}] Cobros API`,
      description: typeof message === 'string' ? message : JSON.stringify(message, null, 2),
      color: color,
      timestamp: new Date().toISOString(),
      fields: []
    };
    
    if (data) {
      if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          embed.fields.push({
            name: key,
            value: typeof value === 'object' ? JSON.stringify(value, null, 2).substring(0, 1000) : String(value).substring(0, 1000),
            inline: true
          });
        });
      } else {
        embed.fields.push({
          name: 'Datos',
          value: String(data).substring(0, 1000),
          inline: false
        });
      }
    }
    
    // Usar fetch nativo (Node 18+) o importar dinámicamente
    const fetchFn = globalThis.fetch || (await import('node-fetch')).default;
    
    await fetchFn(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (err) {
    // No hacer nada si falla el envío a Discord para evitar loops
    console.error('[LOGGER] Error enviando a Discord:', err.message);
  }
}

module.exports = {
  info: (...args) => {
    if (shouldLog('info')) {
      console.log('[INFO]', timeNow(), ...args);
      sendToDiscord('info', args[0], args[1]);
    }
  },
  warn: (...args) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', timeNow(), ...args);
      sendToDiscord('warn', args[0], args[1]);
    }
  },
  error: (...args) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', timeNow(), ...args);
      sendToDiscord('error', args[0], args[1]);
    }
  },
  debug: (...args) => {
    if (shouldLog('debug')) console.debug('[DEBUG]', timeNow(), ...args);
  },
  transaction: (...args) => {
    if (shouldLog('info')) console.log('[TRANSACTION]', timeNow(), ...args);
  },
};
