import {
  inject,
  provide,
  Ref,
  watch,
  WatchOptions,
  shallowRef,
  shallowReadonly,
  onBeforeUnmount,
  ShallowRef,
} from 'vue'
import {
  Bloc,
  BlocEvent,
  BlocState,
  Transition,
  SubscriptionsContainer,
  ObjectInputBloc,
  Rule,
  InputBloc,
} from '@billitech/bloc'
import { BlocContext } from './bloc-context'

type BlocProvideItems<
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
> = {
  bloc: (() => B) | B | undefined
  disposable: boolean
}

export const provideBloc = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
>(
  ID: Symbol | BlocContext<B>,
  bloc: (() => B) | B | undefined,
  disposable: boolean = false,
): void => {
  if (ID instanceof BlocContext) {
    ID = ID.ID
  }
  const state = shallowRef<BlocProvideItems>({
    bloc: bloc,
    disposable: disposable,
  })

  provide(ID, state)
  onBeforeUnmount(() => {
    if (disposable) {
      try {
        if (state.value.bloc instanceof Bloc) state.value.bloc.dispose()
      } catch (e) {}
    }
  })
}

export const useBloc = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
>(
  ID: Symbol | BlocContext<B>,
): B => {
  if (ID instanceof BlocContext) {
    ID = ID.ID
  }

  const storedItem = inject(ID as symbol) as
    | Ref<BlocProvideItems | B | undefined | null>
    | B
    | undefined

  if (storedItem && storedItem instanceof Bloc) {
    return storedItem
  }

  if (storedItem && storedItem.value) {
    if (storedItem.value instanceof Bloc) {
      return storedItem.value
    }
    if (typeof storedItem.value.bloc === 'function') {
      storedItem.value.bloc = storedItem.value.bloc()
    }
  }

  return (storedItem?.value as BlocProvideItems | undefined)?.bloc as B
}

export const useBlocState = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
  S = BlocState<B>,
>(
  bloc: B | Symbol | BlocContext<B>,
  options?: {
    selector?: (state: BlocState<B>) => S
    condition?: (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
  },
): Readonly<Ref<S>> => {
  type State = BlocState<B>
  type Event = BlocEvent<B>

  if (!(bloc instanceof Bloc)) {
    bloc = useBloc(bloc)
  }

  const state = shallowRef<S>(
    options?.selector ? options.selector(bloc.state) : (bloc.state as S),
  )

  const subscription = bloc.transitionStream.subscribe(
    (transition: Transition<State, Event>) => {
      if (!options?.condition || options.condition(transition)) {
        state.value = options?.selector
          ? options.selector(transition.nextState)
          : (transition.nextState as S)
      }
    },
  )

  onBeforeUnmount(() => {
    subscription.unsubscribe()
  })

  return shallowReadonly(state)
}

export const watchBlocState = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
  S = BlocState<B>,
>(
  bloc: B | Symbol | BlocContext<B>,
  callback: (newState: S, oldState: S | undefined) => void,
  options?: WatchOptions & {
    selector?: (state: BlocState<B>) => S
    condition?: (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
  },
): void => {
  const state = useBlocState(bloc, options)
  watch(state, callback, options)
}

export const watchBlocTransition = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
>(
  bloc: B | Symbol | BlocContext<B>,
  callback: (transition: Transition<BlocState<B>, BlocEvent<B>>) => void,
): void => {
  if (!(bloc instanceof Bloc)) {
    bloc = useBloc(bloc)
  }

  const subscription = bloc.transitionStream.subscribe(callback)

  onBeforeUnmount(() => {
    subscription.unsubscribe()
  })
}

export const useSubscriptionsContainer = (): SubscriptionsContainer => {
  const container = new SubscriptionsContainer()

  onBeforeUnmount(() => {
    container.dispose()
  })

  return container
}

export const useRefInputBloc = <T, S = T>(
  ref: Ref<T>,
  options: {
    name: string
    isRequired?: boolean
    rules?: Rule<S | null, string>[] | undefined
    transform?: {
      getter: (value: T) => S
      setter: (value: S) => T
    }
  },
): ObjectInputBloc<S> => {
  const bloc = new ObjectInputBloc<S>({
    ...options,
    value: options.transform?.getter
      ? options.transform.getter(ref.value)
      : (ref.value as any as S),
  })

  watch(ref, () => {
    bloc.emitInputChanged(
      options.transform?.getter
        ? options.transform.getter(ref.value)
        : (ref.value as any as S),
    )
  })

  watchBlocState(bloc, () => {
    ref.value = options.transform?.setter
      ? options.transform.setter(bloc.state.value)
      : (bloc.state.value as any as T)
  })

  return bloc
}

export const useSyncRefInputBloc = <T, S = T>(
  ref: Ref<T>,
  bloc: InputBloc<S, any>,
  options?: {
    transform?: {
      getter: (value: T) => S
      setter: (value: S) => T
    }
  },
): void => {
  watch(ref, () => {
    bloc.emitInputChanged(
      options?.transform?.getter
        ? options.transform.getter(ref.value)
        : (ref.value as any as S),
    )
  })

  watchBlocState(bloc, () => {
    ref.value = options?.transform?.setter
      ? options.transform.setter(bloc.state.value)
      : (bloc.state.value as any as T)
  })
}
