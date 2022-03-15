export abstract class FormHandlerEvent {}

export class ButtonPressed<T> extends FormHandlerEvent {
  constructor(public readonly form: T) {
    super()
  }
}
