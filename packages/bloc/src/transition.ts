export class Transition<State, Event> {
  constructor(
    public readonly currentState: State,
    public readonly event: Event,
    public readonly nextState: State
  ) {}
}
