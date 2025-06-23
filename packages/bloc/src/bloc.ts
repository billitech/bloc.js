import {
  BehaviorSubject,
  Subject,
  Observable,
  Subscribable,
  Observer,
  Subscription,
  from,
  firstValueFrom,
  throwError,
} from 'rxjs'
import { concatMap, filter, map, timeout } from 'rxjs/operators'
import { BlocObserver } from './bloc-observer'
import { Transition } from './transition'
import { deepEqual } from 'fast-equals'
import { Equatable, isEqual } from './equatable'
import { BlocTimeoutException } from './exceptions/timeout-exception'

export type BlocState<B extends Bloc<unknown, unknown>> = B['state']
export type BlocEvent<B extends Bloc<unknown, unknown>> = B['___eventType']
export type MapEventToStateReturn<State> =
  | Generator<State>
  | AsyncGenerator<State>
  | Iterable<State>
  | AsyncIterable<State>
  | Iterator<State>
  | AsyncIterator<State>

export abstract class Bloc<State, Event> implements Subscribable<State> {
  private readonly _state: BehaviorSubject<State>
  private readonly _event: Subject<Event>
  private readonly _transition: Subject<Transition<State, Event>>
  private readonly _transitionSubscription: Subscription
  static observer: BlocObserver = new BlocObserver()
  private emitted: boolean = false
  public closed = false

  constructor(state: State) {
    this._state = new BehaviorSubject<State>(state)
    this._event = new Subject<Event>()
    this._transition = new Subject<Transition<State, Event>>()
    this._transitionSubscription = this.bindEventsToStates()
  }

  get state(): State {
    return this._state.value
  }

  get ___eventType(): Event {
    return {} as Event
  }

  get stream(): Observable<State> {
    return this._state.asObservable()
  }

  get eventStream(): Observable<Event> {
    return this._event.asObservable()
  }

  get transitionStream(): Observable<Transition<State, Event>> {
    return this._transition.asObservable()
  }

  public subscribe(observer?: Partial<Observer<State>>): Subscription
  public subscribe(
    next?: (value: State) => void,
    error?: (error: unknown) => void,
    complete?: () => void,
  ): Subscription
  subscribe(
    next?: (value: State) => void,
    error?: (error: unknown) => void | null,
    complete?: () => void | null,
  ): Subscription
  subscribe(
    observerOrNext?: Partial<Observer<State>> | ((value: State) => void) | null,
    error?: (error: unknown) => void,
    complete?: () => void,
  ): Subscription {
    if (typeof observerOrNext === 'function') {
      return this._state.subscribe({
        next: observerOrNext,
        error: error,
        complete: complete,
      })
    } else {
      return this._state.subscribe({
        next: observerOrNext?.next,
        error: observerOrNext?.error,
        complete: observerOrNext?.complete,
      })
    }
  }

  public add(event: Event) {
    this._event.next(event)
  }

  protected transformEvents(events: Observable<Event>): Observable<Event> {
    return events
  }

  protected transformTransitions(
    transitions: Observable<Transition<State, Event>>,
  ): Observable<Transition<State, Event>> {
    return transitions
  }

  private bindEventsToStates(): Subscription {
    return this.transformTransitions(
      this.transformEvents(this._event).pipe(
        concatMap((event: Event) => {
          this.onEvent(event)
          const stateResult = this.mapEventToState(event)
          const states = Array.isArray(stateResult)
            ? stateResult
            : [stateResult]
          return from(states).pipe(
            map((state) => {
              return new Transition(this.state, event, state)
            }),
          )
        }),
      ),
    ).subscribe((transition: Transition<State, Event>) => {
      if (
        this.emitted === false ||
        !this.statesEqual(transition.currentState, transition.nextState)
      ) {
        this.onTransition(transition)
        this._transition.next(transition)
        this._state.next(transition.nextState)
        this.emitted = true
      }
    })
  }

  statesEqual(currentState: State, nextState: State): boolean {
    if (currentState instanceof Equatable && nextState instanceof Equatable) {
      return isEqual(currentState, nextState)
    } else {
      return deepEqual(currentState, nextState)
    }
  }

  dispose() {
    this.closed = true
    this._state.complete()
    this._transition.complete()
    this._event.complete()
    this._transitionSubscription.unsubscribe()
  }

  onEvent(event: Event): void {
    Bloc.observer.onEvent(this, event)
  }

  onTransition(transition: Transition<State, Event>): void {
    Bloc.observer.onTransition(this, transition)
  }

  firstWhere(
    test: (state: State) => boolean,
    {
      timeLimit,
      timeoutError,
      listenWhen,
    }: {
      timeLimit?: number
      timeoutError?: () => Error
      listenWhen?: (previous: State, current: State) => boolean
    } = {
      timeLimit: 120_000,
    },
  ): Promise<State> {
    if (test(this.state)) {
      return Promise.resolve(this.state)
    }

    let previousState = this.state
    return firstValueFrom(
      this.stream.pipe(
        filter((state) => {
          if (
            (!listenWhen || listenWhen(previousState, state)) &&
            test(state)
          ) {
            return true
          }
          previousState = state
          return false
        }),
        timeout({
          each: timeLimit ?? 120_000,
          with: () => {
            const error = timeoutError
              ? timeoutError()
              : new BlocTimeoutException(`Timeout after ${timeLimit}ms`)
            return throwError(() => error)
          },
        }),
      ),
    )
  }

  protected abstract mapEventToState(event: Event): MapEventToStateReturn<State>
}
