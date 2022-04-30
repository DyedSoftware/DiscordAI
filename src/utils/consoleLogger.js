const getDate = () => {
  return new Date().toISOString();
};

const info = (message) => {
  if (process.env.CONSOLE_MUTE != 'true') console.log(`[INFO - ${getDate()}] ${message}`);
};

const debug = (message) => {
  if (process.env.CONSOLE_MUTE != 'true') console.debug(`[DEBUG - ${getDate()}] ${message}`);
};

const warn = (message) => {
  if (process.env.CONSOLE_MUTE != 'true') console.warn(`[WARNING - ${getDate()}] ${message}`);
};

const error = (message, type) => {
  if (process.env.CONSOLE_MUTE != 'true') console.error(`[${type}] [ERROR - ${getDate()}] ${message}`);
};

module.exports = {
  info,
  debug,
  warn,
  error,
};
