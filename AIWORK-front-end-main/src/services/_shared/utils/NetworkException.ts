import { AxiosError } from 'axios';

export class NetworkException extends Error {
  constructor() {
    super();
    this.name = 'NetworkException';
  }

  public static isNetworkError = (response: Error): response is AxiosError<undefined> => {
    return response instanceof AxiosError && (!response || response.status === 0);
  };
}
