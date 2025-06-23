export type ValidatorFunc<T> = (
  value: T,
  signal?: AbortSignal,
) => boolean | Promise<boolean>
export type ErrorFormatterFunc<E> = (
  field: string,
  errorMessage: E,
) => E | Promise<E>

export class Rule<T, E> {
  protected errorMessage: E
  protected validator: ValidatorFunc<T>
  protected errorFormatter?: ErrorFormatterFunc<E>
  name?: string

  constructor(payload: {
    errorMessage: E
    validator: ValidatorFunc<T>
    errorFormatter?: ErrorFormatterFunc<E>
    name?: string
  }) {
    this.errorMessage = payload.errorMessage
    this.validator = payload.validator
    this.errorFormatter = payload.errorFormatter
    this.name = payload.name
  }

  public error(message: E): Rule<T, E> {
    this.errorMessage = message
    return this
  }

  public validate(
    value: T,
    name: string,
    signal?: AbortSignal,
  ): E | undefined | Promise<E | undefined> {
    const result = this.validator(value, signal)

    if (result instanceof Promise) {
      return result.then((valid) => {
        if (!valid) {
          return this.errorFormatter
            ? this.errorFormatter(name, this.errorMessage)
            : this.getErrorMessage(name)
        }
      })
    }

    if (!result) {
      return this.errorFormatter
        ? this.errorFormatter(name, this.errorMessage)
        : this.getErrorMessage(name)
    }

    return undefined
  }

  public getErrorMessage(field: string): E | Promise<E> {
    if (typeof this.errorMessage === 'string') {
      return this.errorMessage.replaceAll('{field}', field) as unknown as E
    }

    return this.errorMessage
  }
}
