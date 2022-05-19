export type ValidatorFunc<T> = (value: T) => boolean
export type ErrorFormatterFunc<E> = (field: string, errorMessage: E) => E

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

  public validate(value: T, name: string): E | undefined {
    if (!this.validator(value)) {
      return this.errorFormatter
        ? this.errorFormatter(name, this.errorMessage)
        : this.getErrorMessage(name)
    }
  }

  public getErrorMessage(field: string): E {
    if (typeof this.errorMessage == 'string') {
      return this.errorMessage.replaceAll('{field}', field) as unknown as E
    }

    return this.errorMessage
  }
}
