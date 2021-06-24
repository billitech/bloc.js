import { Subscription } from 'rxjs'
import {
  inject,
  provide,
  onMounted,
  Ref,
  onUnmounted,
  watch,
  WatchOptions,
  shallowRef,
  shallowReadonly,
} from 'vue'
import {
  Bloc,
  BlocEvent,
  BlocState,
  Transition,
  SubscriptionsContainer,
} from '@billitech/bloc'
import { BlocContext } from './bloc-context'

export const provideBloc = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>
>(
  ID: Symbol | BlocContext<B>,
  bloc: (() => B) | B | undefined,
  disposable: boolean = false
): void => {
  if (ID instanceof BlocContext) {
    ID = ID.ID
  }
  provide(ID, bloc)

  if (disposable && ID !== undefined) {
    onUnmounted(() => {
      if (bloc instanceof Bloc) {
        bloc.dispose()
      } else {
        useBloc<B>(ID)?.dispose()
      }
    })
  }
}

export const useBloc = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>
>(
  ID: Symbol | BlocContext<B>
): B => {
  if (ID instanceof BlocContext) {
    ID = ID.ID
  }

  const bloc = inject(ID)
  if (typeof bloc === 'function') {
    const blocInstance = bloc() as B
    provideBloc(ID, blocInstance)
    return blocInstance
  }

  return bloc as B
}

export const useBlocState = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>
>(
  bloc: B | Symbol | BlocContext<B>,
  condition: (
    transition: Transition<BlocState<B>, BlocEvent<B>>
  ) => boolean = () => true
): {
  readonly value: Readonly<BlocState<B>>
} => {
  type State = BlocState<B>
  type Event = BlocEvent<B>

  if (!(bloc instanceof Bloc)) {
    bloc = useBloc(bloc)
  }

  const state = shallowRef(bloc.state) as Ref<State>

  const subscription = bloc.transitionStream.subscribe(
    (transition: Transition<State, Event>) => {
      if (condition(transition)) {
        state.value = transition.nextState
      }
    }
  )

  onUnmounted(() => {
    subscription.unsubscribe()
  })

  return shallowReadonly(state)
}

export const watchBlocState = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>
>(
  bloc: B | Symbol | BlocContext<B>,
  callback: (
    newState: BlocState<B>,
    oldState: BlocState<B> | undefined
  ) => void,
  option?: WatchOptions
): void => {
  const state = useBlocState(bloc)
  watch(state, callback, option)
}

export const watchBlocTransition = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>
>(
  bloc: B | Symbol | BlocContext<B>,
  callback: (transition: Transition<BlocState<B>, BlocEvent<B>>) => void
): void => {
  type State = BlocState<B>
  type Event = BlocEvent<B>

  if (!(bloc instanceof Bloc)) {
    bloc = useBloc(bloc)
  }

  const subscription = bloc.transitionStream.subscribe(callback)

  onUnmounted(() => {
    subscription.unsubscribe()
  })
}

export const useSubscriptionsContainer = (): SubscriptionsContainer => {
  const container = new SubscriptionsContainer()

  onUnmounted(() => {
    container.dispose()
  })

  return container
}
