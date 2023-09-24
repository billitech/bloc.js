import { Equatable } from '../equatable'
export class FormValidationException extends Equatable {
  readonly error: Record<string, unknown>
  readonly message: string

  constructor(payload: { error: Record<string, unknown>; message: string }) {
    super()
    this.error = payload.error
    this.message = payload.message
  }

  get props(): any[] {
    return [this.error, this.message]
  }
}
