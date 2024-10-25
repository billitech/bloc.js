export class InputEvent<T, E> {}

export class InputChanged<T> extends InputEvent<T, any> {
  readonly value: T

  constructor(value: T) {
    super()
    this.value = value
  }
}

export class InputUnFocused extends InputEvent<any, any> {
  readonly forceError: boolean

  constructor(
    { forceError }: { forceError?: boolean } | undefined = { forceError: true },
  ) {
    super()
    this.forceError = forceError ?? true
  }
}

export class ResetInput extends InputEvent<any, any> {
  readonly resetValue: boolean
  readonly resetError: boolean
  readonly resetIsPure: boolean
  readonly resetForceError: boolean

  constructor(
    {
      resetValue,
      resetError,
      resetIsPure,
      resetForceError,
    }: {
      resetValue?: boolean
      resetError?: boolean
      resetIsPure?: boolean
      resetForceError?: boolean
    } = {
      resetValue: true,
      resetError: true,
      resetIsPure: true,
      resetForceError: true,
    },
  ) {
    super()
    this.resetValue = resetValue ?? true
    this.resetError = resetError ?? true
    this.resetIsPure = resetIsPure ?? true
    this.resetForceError = resetForceError ?? true
  }
}

export class ValidateInput<E> extends InputEvent<any, E> {
  readonly forceDirty?: boolean
  readonly forceError?: boolean
  constructor(
    { forceDirty, forceError }: { forceDirty: boolean; forceError: boolean } = {
      forceDirty: false,
      forceError: false,
    },
  ) {
    super()
    this.forceDirty = forceDirty ?? false
    this.forceError = forceError ?? false
  }
}

export class InputValidationError<E> extends InputEvent<any, E> {
  readonly error: E

  constructor(error: E) {
    super()
    this.error = error
  }
}
