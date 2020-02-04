export interface AuthParameters {
  /** OAuth app client ID */
  clientID: string;
  /** Authorization URL */
  authorization?: string;
  /** Redirection URL */
  redirectURI?: string;
  /** App scope */
  scopes?: '';
}
