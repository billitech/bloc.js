export type InputValueType<I extends InputState<any, any>> = I['value']
export type InputErrorType<I extends InputState<any, any>> = I['error']

export class InputState<T, E> {
  private readonly _value: T
  private readonly _error?: E
  private readonly _initial: boolean

  constructor(payload: { value: T; error?: E; initial?: boolean }) {
    this._value = payload.value
    this._error = payload.error
    this._initial = payload.initial ?? true
  }

  get value(): T {
    return this._value
  }

  get initial(): boolean {
    return this._initial
  }

  get error(): E | undefined {
    return this._error
  }

  get valid(): boolean {
    return this.error === null || this.error === undefined
  }

  get invalid(): boolean {
    return this.error !== null && this.error !== undefined
  }

  copyWith(payload: {
    value?: T
    error?: E
    initial?: boolean
  }): InputState<T, E> {
    return new InputState({
      value: payload.value ?? this.value,
      error: payload.error ?? this.error,
      initial: payload.initial ?? this.initial,
    })
  }
}
