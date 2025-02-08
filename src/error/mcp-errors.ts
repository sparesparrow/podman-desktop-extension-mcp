export class MCPServerError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MCPConnectionError extends MCPServerError {
  constructor(serverName: string) {
    super(`Connection to ${serverName} failed`, 503);
  }
} 