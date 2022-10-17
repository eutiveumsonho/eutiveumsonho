const winston = require("winston");

// TODO: replace honeycomb stuff for this logger
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

export { logger };
