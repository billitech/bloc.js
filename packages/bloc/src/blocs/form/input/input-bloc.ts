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

export class InputBloc<T, E> extends Bloc<InputState<T, E>, InputEvent<T, E>> {
  readonly name: string
  readonly title: string
  readonly initialValue: T
  readonly validationRules: Rule<T, E>[]

  constructor(payload: { name: string; value: T; rules?: Rule<T, E>[] }) {
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
    return validate<T, E>(value, this.title, this.validationRules)
  }
}