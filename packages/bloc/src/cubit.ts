import { Bloc } from './bloc'

export class CubitEvent<T> {
  constructor(public state: T) {}
}

export abstract class Cubit<State> extends Bloc<State, CubitEvent<State>> {
  private internalChange: boolean = false

  protected async *mapEventToState(
    event: CubitEvent<State>
  ): AsyncGenerator<State> {
    yield event.state
  }

  add(event: CubitEvent<State>): void {
    if (this.internalChange) {
      super.add(event)
    } else {
      throw Error('Cannot change cubit from outside the cubit class')
    }
  }

  protected emit(state: State) {
    this.internalChange = true
    this.add(new CubitEvent(state))
    this.internalChange = false
  }
}
