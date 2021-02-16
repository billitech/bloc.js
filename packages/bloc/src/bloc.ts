import {
  BehaviorSubject,
  Subject,
  Observable,
  Subscribable,
  Observer,
  Subscription,
  from,
} from 'rxjs'
import { concatMap, map } from 'rxjs/operators'
import { BlocObserver } from './bloc-observer'
import { Transition } from './transition'

export type BlocState<B extends Bloc<any, any>> = B['state']
export type BlocEvent<B extends Bloc<any, any>> = B['___eventType']

export abstract class Bloc<State, Event> implements Subscribable<State> {
  private readonly _state: BehaviorSubject<State>
  private readonly _event: Subject<Event>
  private readonly _transition: Subject<Transition<State, Event>>
  private readonly _transitionSubscription: Subscription

  static observer: BlocObserver = new BlocObserver()

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
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription
  subscribe(
    next?: (value: State) => void,
    error?: (error: any) => void | null,
    complete?: () => void | null
  ): Subscription
  subscribe(
    observerOrNext?: Partial<Observer<State>> | ((value: State) => void) | null,
    error?: (error: any) => void,
    complete?: () => void
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

  private bindEventsToStates(): Subscription {
    return this._event
      .pipe(
        concatMap((event: Event) => {
          this.onEvent(event)
          return from(this.mapEventToState(event)).pipe(
            map((state) => {
              return new Transition(this.state, event, state)
            })
          )
        })
      )
      .subscribe((transition) => {
        this.onTransition(transition)
        this._transition.next(transition)
        this._state.next(transition.nextState)
      })
  }

  dispose() {
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

  protected abstract mapEventToState(event: Event): AsyncGenerator<State>
}
