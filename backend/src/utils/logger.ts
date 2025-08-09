export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    console.log(`[INFO] ${new Date().toISOString()}:`, msg, ...args);
  },
  error: (msg: string, error?: unknown) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, msg, error);
  },
  warn: (msg: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${new Date().toISOString()}:`, msg, ...args);
  },
  debug: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}:`, msg, ...args);
    }
  },
};
