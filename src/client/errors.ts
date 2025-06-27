export class RelayAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: any,
    public requestData?: any
  ) {
    super(message);
    this.name = 'RelayAPIError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      responseData: this.responseData,
      requestData: this.requestData,
    };
  }
}

export class RelayConnectionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'RelayConnectionError';
  }
}

export class RelayValidationError extends Error {
  constructor(message: string, public validationErrors?: any) {
    super(message);
    this.name = 'RelayValidationError';
  }
}
