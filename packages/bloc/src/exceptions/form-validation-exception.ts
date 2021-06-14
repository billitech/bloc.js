export class FormValidationException {
  readonly error: Map<string, string[]>
  readonly message: string

  constructor(payload: { error: Map<string, string[]>; message: string }) {
    this.error = payload.error
    this.message = payload.message
  }
}
