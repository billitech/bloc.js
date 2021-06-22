import { Subscription } from 'rxjs'
import {
  ref,
  inject,
  provide,
  readonly,
  onMounted,
  Ref,
  DeepReadonly,
  onUnmounted,
  watch,
  WatchOptions,
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
): [
  {
    readonly value: DeepReadonly<BlocState<B>>
  },
  (event: BlocEvent<B>) => void,
  (
    callback: (
      newState: BlocState<B>,
      oldState: BlocState<B> | undefined
    ) => void,
    option?: WatchOptions
  ) => void
] => {
  type State = BlocState<B>
  type Event = BlocEvent<B>

  if (bloc instanceof BlocContext) {
    bloc = bloc.ID
  }

  let blocInstance: B

  if (bloc instanceof Bloc) {
    blocInstance = bloc
  } else {
    blocInstance = useBloc(bloc)
  }

  const state = ref(blocInstance.state) as Ref<State>
  const dispatch = (event: Event) => {
    blocInstance.add(event)
  }

  const onChanged = (
    callback: (newState: State, oldState: State | undefined) => void,
    option?: WatchOptions
  ) => {
    watch(state, callback, option)
  }

  let subscription: Subscription

  onMounted(() => {
    subscription = blocInstance.transitionStream.subscribe(
      (transition: Transition<State, Event>) => {
        if (condition(transition)) {
          state.value = transition.nextState
        }
      }
    )
  })

  onUnmounted(() => {
    subscription?.unsubscribe()
  })

  return [readonly(state), dispatch, onChanged]
}

export const useSubscriptionsContainer = (): SubscriptionsContainer => {
  const container = new SubscriptionsContainer()

  onUnmounted(() => {
    container.dispose()
  })

  return container
}
