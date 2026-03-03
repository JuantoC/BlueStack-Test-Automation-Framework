export class BusinessLogicError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessLogicError';
        // Mantiene la traza correcta en TS/V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BusinessLogicError);
        }
    }
}