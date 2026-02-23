import winston from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, label }) => {
        const tag = label ? `[${label}] ` : '';
        return `${timestamp} ${level}: ${tag}${message}`;
    })
);

const logger = winston.createLogger({
    level: 'debug',
    format: logFormat,
    transports: [
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '3d'
        }),
        new winston.transports.Console({
            level: 'info',
            format: consoleFormat
        })
    ],
});

/**
 * Crea un transport dedicado para una sesión y lo añade al logger global.
 * @returns El transport creado para poder removerlo luego.
 */
export function addSessionTransport(sessionLabel: string) {
    const sessionFile = new winston.transports.File({
        filename: path.join(logDir, `session-${sessionLabel}.log`),
        level: 'debug',
        // Formato simple para que el log de sesión sea legible como texto
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
        )
    });
    logger.add(sessionFile);
    return sessionFile;
}

export default logger;