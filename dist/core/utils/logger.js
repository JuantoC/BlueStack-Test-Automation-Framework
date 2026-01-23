import winston from 'winston';
import fs from 'fs';
import path from 'path';
// 1. Crear la carpeta de logs si no existe
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
// 2. Definir el formato de los logs
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), // Para capturar el stack trace del error
winston.format.splat(), winston.format.json());
// 3. Formato amigable para la consola (con colores)
const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message, label }) => {
    const tag = label ? `[${label}] ` : '';
    return `${timestamp} ${level}: ${tag}${message}`;
}));
const logger = winston.createLogger({
    level: 'debug', // Nivel base: captura todo desde debug hacia arriba
    format: logFormat,
    transports: [
        // Guarda TODOS los logs (incluyendo debug y reintentos)
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            level: 'debug'
        }),
        // Guarda SOLO los errores críticos
        new winston.transports.File({
            filename: path.join(logDir, 'errors.log'),
            level: 'error'
        }),
        // Mostra en CONSOLA solo lo importante (info, warn, error)
        new winston.transports.Console({
            level: 'info',
            format: consoleFormat
        })
    ],
});
export default logger;
//# sourceMappingURL=logger.js.map