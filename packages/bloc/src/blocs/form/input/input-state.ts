import { Equatable } from '../../../equatable'
import { Optional } from '../../../optional'
export type InputValueType<I extends InputState<any, any>> = I['value']
export type InputErrorType<I extends InputState<any, any>> = I['error']

export class InputState<T, E> extends Equatable {
  private readonly _value: T
  private readonly _error?: E | null
  private readonly _isPure: boolean
  private readonly _forceError: boolean
  private readonly _isValidating: boolean

  constructor(payload: {
    value: T
    error?: E | null
    isPure?: boolean
    forceError?: boolean
    isValidating?: boolean
  }) {
    super()
    this._value = payload.value
    this._error = payload.error
    this._isPure = payload.isPure ?? true
    this._forceError = payload.forceError ?? false
    this._isValidating = payload.isValidating ?? false
  }

  get value(): T {
    return this._value
  }

  get isPure(): boolean {
    return this._isPure
  }

  get forceError(): boolean {
    return this._forceError
  }

  get isValidating(): boolean {
    return this._isValidating
  }

  get isNotValidating(): boolean {
    return !this._isValidating
  }

  get error(): E | undefined | null {
    return this._error
  }

  get hasError() {
    return this.error !== null && this.error != undefined
  }

  get canDisplayError(): boolean {
    return (!this.isPure || this.forceError) && this.hasError
  }

  get displayError(): E | undefined | null {
    return this.canDisplayError ? this.error : null
  }

  get isValid(): boolean {
    return this.error === null || this.error === undefined
  }

  get isInvalid(): boolean {
    return this.error !== null && this.error !== undefined
  }

  copyWith(payload: {
    value?: Optional<T>
    error?: Optional<E | null | undefined>
    isPure?: Optional<boolean>
    forceError?: Optional<boolean>
    isValidating?: Optional<boolean>
  }): InputState<T, E> {
    return new InputState({
      value:
        payload.value && payload.value.isValid
          ? payload.value.value
          : this.value,
      error:
        payload.error && payload.error.isValid
          ? payload.error.value
          : this.error,
      isPure:
        payload.isPure && payload.isPure.isValid
          ? payload.isPure.value
          : this.isPure,
      forceError:
        payload.forceError && payload.forceError.isValid
          ? payload.forceError.value
          : this.forceError,
      isValidating:
        payload.isValidating && payload.isValidating.isValid
          ? payload.isValidating.value
          : this.isValidating,
    })
  }

  get props(): any[] {
    return [
      this.value,
      this.error,
      this.isPure,
      this.forceError,
      this.isValidating,
    ]
  }
}
