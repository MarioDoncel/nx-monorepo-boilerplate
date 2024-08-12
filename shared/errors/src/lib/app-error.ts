export class ApplicationError extends Error {
  statusCode: number;
  traceCode?: string;
  isReportable?: true;
  tags?: { [key: string]: string };
  constructor({
    message,
    statusCode,
    traceCode,
    isReportable,
    tags,
  }: {
    message: string;
    statusCode?: number;
    traceCode?: string;
    isReportable?: true;
    tags?: { [key: string]: string };
  }) {
    super(message);
    this.statusCode = statusCode ?? 500;
    this.traceCode = traceCode;
    this.isReportable = isReportable;
    this.tags = tags;
  }
}
