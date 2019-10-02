export class CustomStorageError {
  public errorCode: string;
  public message: string | undefined;

  constructor(errorcode: string, message?: string) {
    this.errorCode = errorcode;
    this.message = message;
  }
}
