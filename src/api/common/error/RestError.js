// @flow
import {TutanotaError} from "./TutanotaError"

export class ConnectionError extends TutanotaError {
	static CODE = 0
	constructor(msg: string) {
		super("ConnectionError", msg)
	}
}

export class BadRequestError extends TutanotaError {
	static CODE = 400
	constructor(msg: string) {
		super("BadRequestError", msg)
	}
}

export class NotAuthenticatedError extends TutanotaError {
	static CODE = 401
	constructor(msg: string) {
		super("NotAuthenticatedError", msg)
	}
}

export class NotAuthorizedError extends TutanotaError {
	static CODE = 403
	constructor(msg: string) {
		super("NotAuthorizedError", msg)
	}
}

export class NotFoundError extends TutanotaError {
	static CODE = 404
	constructor(msg: string) {
		super("NotFoundError", msg)
	}
}

export class MethodNotAllowedError extends TutanotaError {
	static CODE = 405
	constructor(msg: string) {
		super("MethodNotAllowedError", msg)
	}
}

export class PreconditionFailedError extends TutanotaError {
	static CODE = 412
	constructor(msg: string) {
		super("PreconditionFailedError", msg)
	}
}

export class TooManyRequestsError extends TutanotaError {
	static CODE = 429
	constructor(msg: string) {
		super("TooManyRequestsError", msg)
	}
}

export class SessionExpiredError extends TutanotaError {
	static CODE = 440
	constructor(msg: string) {
		super("SessionExpiredError", msg)
	}
}

export class AccessDeactivatedError extends TutanotaError {
	static CODE = 470
	constructor(msg: string) {
		super("AccessDeactivatedError", msg)
	}
}

export class AccessExpiredError extends TutanotaError {
	static CODE = 471
	constructor(msg: string) {
		super("AccessExpiredError", msg)
	}
}

export class AccessBlockedError extends TutanotaError {
	static CODE = 472
	constructor(msg: string) {
		super("AccessBlockedError", msg)
	}
}

export class InvalidDataError extends TutanotaError {
	static CODE = 473
	constructor(msg: string) {
		super("InvalidDataError", msg)
	}
}

export class InvalidSoftwareVersionError extends TutanotaError {
	static CODE = 474
	constructor(msg: string) {
		super("InvalidSoftwareVersionError", msg)
	}
}

export class LimitReachedError extends TutanotaError {
	static CODE = 475
	constructor(msg: string) {
		super("LimitReachedError", msg)
	}
}

export class InternalServerError extends TutanotaError {
	static CODE = 500
	constructor(msg: string) {
		super("InternalServerError", msg)
	}
}

export class BadGatewayError extends TutanotaError {
	static CODE = 502
	constructor(msg: string) {
		super("BadGatewayError", msg)
	}
}

export class ServiceUnavailableError extends TutanotaError {
	static CODE = 503
	constructor(msg: string) {
		super("ServiceUnavailableError", msg)
	}
}

export class InsufficientStorageError extends TutanotaError {
	static CODE = 507
	constructor(msg: string) {
		super("InsufficientStorageError", msg)
	}
}

export class ResourceError extends TutanotaError {
	constructor(msg: string) {
		super("ResourceError", msg)
	}
}

/**
 * Attention: When adding an Error also add it in WorkerProtocol.ErrorNameToType.
 */
export function handleRestError(errorCode: number, message: string) {
	message = `${errorCode}: ${message}`
	switch (errorCode) {
		case ConnectionError.CODE:
			return new ConnectionError(message);
		case BadRequestError.CODE:
			return new BadRequestError(message);
		case NotAuthenticatedError.CODE:
			return new NotAuthenticatedError(message);
		case NotAuthorizedError.CODE:
			return new NotAuthorizedError(message);
		case NotFoundError.CODE:
			return new NotFoundError(message);
		case MethodNotAllowedError.CODE:
			return new MethodNotAllowedError(message);
		case PreconditionFailedError.CODE:
			return new PreconditionFailedError(message);
		case TooManyRequestsError.CODE:
			return new TooManyRequestsError(message);
		case SessionExpiredError.CODE:
			return new SessionExpiredError(message);
		case AccessDeactivatedError.CODE:
			return new AccessDeactivatedError(message);
		case AccessExpiredError.CODE:
			return new AccessExpiredError(message);
		case AccessBlockedError.CODE:
			return new AccessBlockedError(message);
		case InvalidDataError.CODE:
			return new InvalidDataError(message);
		case InvalidSoftwareVersionError.CODE:
			return new InvalidSoftwareVersionError(message);
		case LimitReachedError.CODE:
			return new LimitReachedError(message);
		case InternalServerError.CODE:
			return new InternalServerError(message);
		case BadGatewayError.CODE:
			return new BadGatewayError(message);
		case ServiceUnavailableError.CODE:
			return new ServiceUnavailableError(message);
		case InsufficientStorageError.CODE:
			return new InsufficientStorageError(message);
		default:
			return new ResourceError(message);
	}
}