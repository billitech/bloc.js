import { ApiResponse } from '../api'
import { Equatable } from '../equatable'
export class FormValidationException extends Equatable {
  readonly errors: Record<string, string>
  readonly message: string
  readonly statusCode: string
  readonly responseCode: string

  constructor(payload: {
    message: string
    errors: Record<string, string>
    statusCode?: string
    responseCode?: string
  }) {
    super()
    this.errors = payload.errors
    this.message = payload.message
    this.statusCode = payload.statusCode ?? '422'
    this.responseCode = payload.responseCode ?? '422'
  }

  apiResponse<T>(): ApiResponse<T> {
    return {
      status: false,
      statusCode: this.statusCode,
      responseCode: this.responseCode,
      message: this.message,
      data: null,
      errors: this.errors,
    }
  }

  get props(): any[] {
    return [this.errors, this.message]
  }
}
