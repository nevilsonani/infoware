export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const wrap = (fn: (...args: any[]) => Promise<any>) => {
  return (req: any, res: any, next: any) => fn(req, res, next).catch(next);
};


