export class Optional<T> {
  constructor(
    readonly _value?: T,
    readonly isValid: boolean = false,
  ) {}

  public get value(): T {
    return this._value as T
  }

  static value<T>(value: T): Optional<T> {
    return new Optional(value, true)
  }

  static null<T>(): Optional<T> {
    return new Optional()
  }
}
