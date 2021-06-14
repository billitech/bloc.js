export class InputEvent<T, E> {}

export class InputChanged<T> extends InputEvent<T, any> {
  readonly value: T

  constructor(value: T) {
    super()
    this.value = value
  }
}

export class InputUnFocused extends InputEvent<any, any> {}

export class ResetInput extends InputEvent<any, any> {}

export class InputValidationError<E> extends InputEvent<any, E> {
  readonly error: E

  constructor(error: E) {
    super()
    this.error = error
  }
}
