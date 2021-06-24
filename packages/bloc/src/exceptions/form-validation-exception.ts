export class FormValidationException {
  readonly error: Record<string, string[]>
  readonly message: string

  constructor(payload: { error: Record<string, string[]>; message: string }) {
    this.error = payload.error
    this.message = payload.message
  }
}