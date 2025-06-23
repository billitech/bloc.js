import { Bloc } from '../../../bloc'
import { InputState } from './input-state'
import {
  AsyncValidationCompleted,
  InputChanged,
  InputEvent,
  InputUnFocused,
  InputValidationError,
  ResetInput,
  ValidateInput,
} from './input-event'
import { Rule, validate } from './validation'
import { toTitleCase } from '../../../util'
import { Optional } from '../../../optional'
import { SubscriptionsContainer } from '../../../subscriptions-container'
import { combineLatestWith, distinct, Observable } from 'rxjs'

export abstract class InputBloc<T, E> extends Bloc<
  InputState<T, E>,
  InputEvent<T, E>
> {
  readonly name: string
  readonly title: string
  readonly initialValue: T
  readonly validationRules: Rule<T, E>[]
  readonly isRequired: boolean
  readonly id: string
  readonly subscriptionsContainer = new SubscriptionsContainer()
  readonly errorFormatter?: (value: E) => E
  private abortController: AbortController | null = null

  constructor(payload: {
    name: string
    value: T
    error?: E | null
    isRequired?: boolean
    rules?: Rule<T, E>[]
    errorFormatter?: (value: E) => E
  }) {
    super(
      new InputState({
        value: payload.value,
        isPure: true,
        forceError: false,
        error: payload.error,
        isValidating: false,
      }),
    )
    this.initialValue = payload.value
    this.name = payload.name
    this.title = toTitleCase(payload.name)
    this.validationRules = payload.rules ?? []
    this.isRequired = payload.isRequired ?? false
    this.errorFormatter = payload.errorFormatter
    this.id = `${payload.name}-${(Math.random() + 1).toString(36).substring(7)}`
  }

  protected *mapEventToState(event: InputEvent<T, E>) {
    if (event instanceof InputChanged) {
      this.cancelOngoingValidation()

      const value = event.value
      const abortToken = new AbortController()
      this.abortController = abortToken

      const validationResult = this.validate(value, abortToken.signal)

      if (validationResult instanceof Promise) {
        validationResult
          .then((error) => {
            if (!abortToken.signal.aborted && value === this.state.value) {
              this.add(new AsyncValidationCompleted(value, error))
            }
          })
          .catch((error) =>
            this.handleValidationError(error, value, abortToken),
          )

        yield this.state.copyWith({
          value: Optional.value(value),
          isPure: Optional.value(false),
          forceError: Optional.value(false),
          error: Optional.value(undefined),
          isValidating: Optional.value(true),
        })
      } else {
        yield this.state.copyWith({
          value: Optional.value(value),
          isPure: Optional.value(false),
          forceError: Optional.value(false),
          error: Optional.value(validationResult),
          isValidating: Optional.value(false),
        })
      }
    } else if (event instanceof AsyncValidationCompleted) {
      if (event.value === this.state.value) {
        yield this.state.copyWith({
          error: Optional.value(event.error),
          isValidating: Optional.value(false),
        })
      }
    } else if (event instanceof InputUnFocused) {
      this.cancelOngoingValidation()

      const value = this.state.value
      const abortToken = new AbortController()
      this.abortController = abortToken

      const validationResult = this.validate(value, abortToken.signal)

      if (validationResult instanceof Promise) {
        validationResult
          .then((error) => {
            if (!abortToken.signal.aborted && value === this.state.value) {
              this.add(new AsyncValidationCompleted(value, error))
            }
          })
          .catch((error) =>
            this.handleValidationError(error, value, abortToken),
          )

        yield this.state.copyWith({
          isPure: Optional.value(false),
          forceError: Optional.value(event.forceError),
          isValidating: Optional.value(true),
        })
      } else {
        yield this.state.copyWith({
          isPure: Optional.value(false),
          forceError: Optional.value(event.forceError),
          error: Optional.value(validationResult),
          isValidating: Optional.value(false),
        })
      }
    } else if (event instanceof ValidateInput) {
      this.cancelOngoingValidation()

      const value = this.state.value
      const abortToken = new AbortController()
      this.abortController = abortToken

      const validationResult = this.validate(value, abortToken.signal)

      if (validationResult instanceof Promise) {
        validationResult
          .then((error) => {
            if (!abortToken.signal.aborted && value === this.state.value) {
              this.add(new AsyncValidationCompleted(value, error))
            }
          })
          .catch((error) =>
            this.handleValidationError(error, value, abortToken),
          )

        yield this.state.copyWith({
          isPure: Optional.value(this.state.isPure),
          forceError: Optional.value(true),
          isValidating: Optional.value(true),
        })
      } else {
        yield this.state.copyWith({
          isPure: Optional.value(this.state.isPure),
          forceError: Optional.value(true),
          error: Optional.value(validationResult),
          isValidating: Optional.value(false),
        })
      }
    } else if (event instanceof ResetInput) {
      this.cancelOngoingValidation()

      const abortToken = new AbortController()
      this.abortController = abortToken

      const value = event.resetValue ? this.initialValue : this.state.value
      const validationResult = event.resetError
        ? this.validate(value, abortToken.signal)
        : this.state.error

      if (validationResult instanceof Promise) {
        validationResult
          .then((error) => {
            if (!abortToken.signal.aborted && value === this.state.value) {
              this.add(new AsyncValidationCompleted(value, error))
            }
          })
          .catch((error) =>
            this.handleValidationError(error, value, abortToken),
          )

        yield this.state.copyWith({
          isPure: Optional.value(event.resetIsPure ? true : this.state.isPure),
          forceError: Optional.value(
            event.resetForceError ? false : this.state.forceError,
          ),
          value: Optional.value(
            event.resetValue ? this.initialValue : this.state.value,
          ),
          isValidating: Optional.value(true),
        })
      } else {
        yield this.state.copyWith({
          isPure: Optional.value(event.resetIsPure ? true : this.state.isPure),
          forceError: Optional.value(
            event.resetForceError ? false : this.state.forceError,
          ),
          error: Optional.value(validationResult),
          value: Optional.value(
            event.resetValue ? this.initialValue : this.state.value,
          ),
          isValidating: Optional.value(false),
        })
      }
    } else if (event instanceof InputValidationError) {
      this.cancelOngoingValidation()

      yield this.state.copyWith({
        error: Optional.value(event.error),
        isPure: Optional.value(false),
        forceError: Optional.value(true),
        isValidating: Optional.value(false),
      })
    }
  }

  private cancelOngoingValidation() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  private handleValidationError(
    error: any,
    value: T,
    abortToken: AbortController,
  ) {
    if (!abortToken.signal.aborted && value === this.state.value) {
      console.error('Validation error:', error)
      this.add(
        new InputValidationError<E>(this.formatValidationError(error) as E),
      )
    }
  }

  private formatValidationError(error: any): E | string {
    if (typeof error === 'string') return error
    return 'Validation error occurred.'
  }

  abstract validateRequired(
    value: T,
    signal?: AbortSignal,
  ): E | undefined | Promise<E | undefined>

  emitInputChanged(value: T) {
    this.add(new InputChanged<T>(value))
  }

  emitInputUnFocused(payload?: { forceError?: boolean }) {
    this.add(new InputUnFocused(payload))
  }

  emitResetInput(payload?: {
    resetValue?: boolean
    resetError?: boolean
    resetIsPure?: boolean
    resetForceError?: boolean
  }) {
    this.add(new ResetInput(payload))
  }

  emitValidateInput(payload?: { forceDirty: boolean; forceError: boolean }) {
    this.add(new ValidateInput(payload))
  }

  emitInputValidationError(error: E) {
    this.add(new InputValidationError<E>(error))
  }

  _doValidate(value: T, signal?: AbortSignal) {
    if (this.isRequired) {
      const error = this.validateRequired(value, signal)
      if (error instanceof Promise) {
        return error.then((error) => {
          if (error) {
            return error
          }
          return validate<T, E>(value, this.title, this.validationRules, signal)
        })
      }
      if (error) {
        return error
      }
      return validate<T, E>(value, this.title, this.validationRules, signal)
    }

    const requiredError = this.validateRequired(value, signal)
    if (requiredError instanceof Promise) {
      return requiredError.then((requiredError) => {
        if (requiredError === undefined) {
          return validate<T, E>(value, this.title, this.validationRules, signal)
        }
      })
    }
    if (requiredError === undefined) {
      return validate<T, E>(value, this.title, this.validationRules, signal)
    }
  }

  validate(value: T, signal?: AbortSignal) {
    const error = this._doValidate(value, signal)
    if (error instanceof Promise) {
      return error.then((error) => {
        if (error != undefined && this.errorFormatter) {
          return this.errorFormatter(error)
        }
        return error
      })
    }

    if (error != undefined && this.errorFormatter != null) {
      return this.errorFormatter(error)
    }

    return error
  }

  addRules(rules: Rule<T, E>[], forceValidation: boolean = false) {
    this.validationRules.push(...rules)
    if (forceValidation) {
      this.emitValidateInput()
    }
  }

  subscribeToInputBlocs(blocs: InputBloc<unknown, unknown>[]) {
    if (blocs.length === 0) return

    if (blocs.length === 1) {
      this.subscriptionsContainer.add = blocs[0].subscribe(() => {
        this.emitValidateInput()
      })
      return
    }

    let stream: Observable<unknown> = blocs[0].stream
    for (const bloc of blocs.slice(1)) {
      stream = stream.pipe(combineLatestWith(bloc.stream.pipe(distinct())))
    }

    this.subscriptionsContainer.add = stream.subscribe(() => {
      this.emitValidateInput()
    })
  }

  dispose(): void {
    this.cancelOngoingValidation()
    this.subscriptionsContainer.dispose()
    super.dispose()
  }
}
