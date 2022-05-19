import { Bloc } from '../../../bloc'
import { InputState } from './input-state'
import {
  InputChanged,
  InputEvent,
  InputUnFocused,
  InputValidationError,
  ResetInput,
} from './input-event'
import { Rule, validate } from './validation'
import { toTitleCase } from '../../../util'

export abstract class InputBloc<T, E> extends Bloc<
  InputState<T, E>,
  InputEvent<T, E>
> {
  readonly name: string
  readonly title: string
  readonly initialValue: T
  readonly validationRules: Rule<T, E>[]
  readonly isRequired: boolean

  constructor(payload: {
    name: string
    value: T
    isRequired: false
    rules?: Rule<T, E>[]
  }) {
    super(
      new InputState({
        value: payload.value,
        initial: true,
      })
    )
    this.initialValue = payload.value
    this.name = payload.name
    this.title = toTitleCase(payload.name)
    this.validationRules = payload.rules ?? []
    this.isRequired = payload.isRequired
  }

  protected async *mapEventToState(event: InputEvent<T, E>) {
    if (event instanceof InputChanged) {
      yield this.state.copyWith({
        value: event.value,
        initial: false,
        error: this.validate(event.value) ?? null,
      })
    } else if (event instanceof InputUnFocused) {
      yield this.state.copyWith({
        initial: false,
        error: this.validate(this.state.value) ?? null,
      })
    } else if (event instanceof ResetInput) {
      yield this.state.copyWith({
        initial: true,
        value: this.initialValue,
      })
    } else if (event instanceof InputValidationError) {
      yield this.state.copyWith({
        error: event.error,
        initial: false,
      })
    }
  }

  abstract validateRequired(value: T): E | undefined

  emitInputChanged(value: T) {
    this.add(new InputChanged<T>(value))
  }

  emitInputUnFocused() {
    this.add(new InputUnFocused())
  }

  emitResetInput() {
    this.add(new ResetInput())
  }

  emitInputValidationError(error: E) {
    this.add(new InputValidationError<E>(error))
  }

  validate(value: T) {
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
}
