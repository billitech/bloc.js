import {
  inject,
  provide,
  Ref,
  watch,
  WatchOptions,
  shallowRef,
  onBeforeUnmount,
  computed,
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

  const state = shallowRef(bloc.state)

  const subscription = bloc.transitionStream.subscribe(
    (transition: Transition<State, Event>) => {
      if (!options?.condition || options.condition(transition)) {
        state.value = transition.nextState
      }
    },
  )

  onBeforeUnmount(() => {
    subscription.unsubscribe()
  })

  return computed(() =>
    options?.selector ? options.selector(state.value) : state.value,
  )
}

export const useBlocStates = <
  B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
  S = BlocState<B>,
>(
  bloc: B | Symbol | BlocContext<B>,
  options?: {
    selector?: (state: BlocState<B>) => S
    condition?: (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
  },
): Readonly<Ref<[S, S | undefined]>> => {
  type State = BlocState<B>
  type Event = BlocEvent<B>

  if (!(bloc instanceof Bloc)) {
    bloc = useBloc(bloc)
  }

  const state = shallowRef<[BlocState<B>, BlocState<B> | undefined]>([
    bloc.state,
    undefined,
  ])

  const subscription = bloc.transitionStream.subscribe(
    (transition: Transition<State, Event>) => {
      if (!options?.condition || options.condition(transition)) {
        state.value = [transition.nextState, state.value[0]]
      }
    },
  )

  onBeforeUnmount(() => {
    subscription.unsubscribe()
  })

  return computed((oldValue) => {
    const newValue1 = options?.selector
      ? options.selector(state.value[0])
      : state.value[0]

    const newValue2 =
      state.value[1] && options?.selector
        ? options.selector(state.value[1])
        : state.value[1]

    if (oldValue && oldValue[0] == newValue1 && oldValue[1] == newValue2) {
      return oldValue
    }

    return [newValue1 as S, newValue2 as S | undefined]
  })
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
  const getValue = computed(() =>
    options.transform?.getter
      ? options.transform.getter(ref.value)
      : (ref.value as any as S),
  )
  const bloc = new ObjectInputBloc<S>({
    ...options,
    value: getValue.value,
  })

  const blocState = useBlocState(bloc)

  const setValue = computed(() => {
    return options.transform?.setter
      ? options.transform.setter(blocState.value.value)
      : (blocState.value.value as any as T)
  })

  watch(
    getValue,
    (getValue) => {
      bloc.emitInputChanged(getValue)
    },
    {
      flush: 'sync',
    },
  )

  watch(
    setValue,
    (setValue) => {
      ref.value = setValue
    },
    {
      flush: 'sync',
    },
  )

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
  const blocState = useBlocState(bloc)
  const getValue = computed(() =>
    options?.transform?.getter
      ? options.transform.getter(ref.value)
      : (ref.value as any as S),
  )
  const setValue = computed(() => {
    return options?.transform?.setter
      ? options.transform.setter(blocState.value.value)
      : (blocState.value.value as any as T)
  })

  watch(
    getValue,
    (getValue) => {
      bloc.emitInputChanged(getValue)
    },
    {
      flush: 'sync',
      immediate: true,
    },
  )

  watch(
    setValue,
    (setValue) => {
      ref.value = setValue
    },
    {
      flush: 'sync',
    },
  )
}

export const useSyncInputBlocs = <T, S = T>(
  bloc1: InputBloc<T, any>,
  bloc2: InputBloc<S, any>,
  options?: {
    transform?: {
      getter: (value: T) => S
      setter: (value: S) => T
    }
  },
): void => {
  const bloc1State = useBlocState(bloc1)
  const bloc2State = useBlocState(bloc2)

  const getValue = computed(() =>
    options?.transform?.getter
      ? options.transform.getter(bloc1State.value.value)
      : (bloc1State.value.value as any as S),
  )
  const setValue = computed(() => {
    return options?.transform?.setter
      ? options.transform.setter(bloc2State.value.value)
      : (bloc2State.value.value as any as T)
  })

  watch(
    getValue,
    (getValue) => {
      bloc2.emitInputChanged(getValue)
    },
    {
      flush: 'sync',
      immediate: true,
    },
  )

  watch(
    setValue,
    (setValue) => {
      bloc1.emitInputChanged(setValue)
    },
    {
      flush: 'sync',
    },
  )
}
