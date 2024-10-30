import { Bloc } from '../../../bloc'
import { InputState } from './input-state'
import {
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
import {
  combineLatest,
  combineLatestWith,
  distinct,
  Observable,
  OperatorFunction,
} from 'rxjs'

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

  protected async *mapEventToState(event: InputEvent<T, E>) {
    if (event instanceof InputChanged) {
      yield this.state.copyWith({
        value: Optional.value(event.value),
        isPure: Optional.value(false),
        forceError: Optional.value(false),
        error: Optional.value(this.validate(event.value)),
      })
    } else if (event instanceof InputUnFocused) {
      yield this.state.copyWith({
        isPure: Optional.value(false),
        forceError: Optional.value(event.forceError),
        error: Optional.value(this.validate(this.state.value)),
      })
    } else if (event instanceof ValidateInput) {
      yield this.state.copyWith({
        isPure: Optional.value(this.state.isPure),
        forceError: Optional.value(true),
        error: Optional.value(this.validate(this.state.value)),
      })
    } else if (event instanceof ResetInput) {
      yield this.state.copyWith({
        isPure: Optional.value(event.resetIsPure ? true : this.state.isPure),
        forceError: Optional.value(
          event.resetForceError ? false : this.state.forceError,
        ),
        error: event.resetError
          ? Optional.value(this.validate(this.state.value))
          : Optional.value(this.state.error),
        value: Optional.value(
          event.resetValue ? this.initialValue : this.state.value,
        ),
      })
    } else if (event instanceof InputValidationError) {
      yield this.state.copyWith({
        error: Optional.value(event.error),
        isPure: Optional.value(false),
        forceError: Optional.value(true),
      })
    }
  }

  abstract validateRequired(value: T): E | undefined

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

  _doValidate(value: T) {
    if (this.isRequired) {
      const error = this.validateRequired(value)
      if (error) {
        return error
      }
      return validate<T, E>(value, this.title, this.validationRules)
    } else if (this.validateRequired(value) == undefined) {
      return validate<T, E>(value, this.title, this.validationRules)
    }
  }

  validate(value: T) {
    const error = this._doValidate(value)
    if (error != null && this.errorFormatter != null) {
      return this.errorFormatter!(error)
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
    if (blocs.length == 0) {
      return
    }

    if (blocs.length == 1) {
      this.subscriptionsContainer.add = blocs[0].subscribe(() => {
        this.emitValidateInput()
      })
      return
    }

    let stream: Observable<unknown> = blocs[0].stream
    for (const bloc of blocs.slice(1)) {
      stream = stream.pipe(combineLatestWith(bloc.stream.pipe(distinct())))
    }

    this.subscriptionsContainer.add = stream.subscribe((_) => {
      this.emitValidateInput()
    })
  }

  dispose(): void {
    this.subscriptionsContainer.dispose()
    super.dispose()
  }
}
