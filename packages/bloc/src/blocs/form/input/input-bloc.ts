import { Bloc } from '../../../bloc'
import { InputState } from './input-state'
import {
  InputChanged,
  InputEvent,
  InputUnFocused,
  InputValidationError,
  ResetInput,
} from './input-event'

export abstract class InputBloc<T, E> extends Bloc<
  InputState<T, E>,
  InputEvent<T, E>
> {
  readonly name: string
  readonly initialValue: T

  constructor(payload: { name: string; value: T }) {
    super(
      new InputState({
        value: payload.value,
        initial: true,
      })
    )
    this.initialValue = payload.value
    this.name = payload.name
  }

  protected async *mapEventToState(event: InputEvent<T, E>) {
    if (event instanceof InputChanged) {
      yield this.state.copyWith({
        value: event.value,
        initial: false,
        error: this.validate(event.value),
      })
    } else if (event instanceof InputUnFocused) {
      yield this.state.copyWith({
        initial: false,
        error: this.validate(this.state.value),
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

  abstract validate(value: T): E | undefined
}
