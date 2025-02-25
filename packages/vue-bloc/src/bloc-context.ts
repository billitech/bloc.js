import { Bloc, BlocEvent, BlocState, Transition } from '@billitech/bloc'
import {
  createVNode,
  defineComponent,
  Fragment,
  PropType,
  SetupContext,
  SlotsType,
  VNodeChild,
  WatchOptions,
} from 'vue'
import {
  provideBloc,
  useBloc,
  useBlocState,
  useBlocStates,
  watchBlocState,
  watchBlocTransition,
} from './compositions'

export class BlocContext<B extends Bloc<BlocState<B>, BlocEvent<B>>> {
  private readonly _ID: Symbol

  constructor() {
    this._ID = this.createID()
  }

  private createID() {
    return Symbol(
      'bloc.' +
        Array(16)
          .fill(0)
          .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
          .join('') +
        Date.now().toString(24),
    )
  }

  get ID() {
    return this._ID
  }

  provideBloc(bloc: (() => B) | B | undefined, disposable: boolean = false) {
    provideBloc(this, bloc, disposable)
  }

  useBloc() {
    return useBloc<B>(this)
  }

  useBlocState<S = BlocState<B>>(options?: {
    selector?: (state: BlocState<B>) => S
    condition?: (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
  }) {
    return useBlocState<B, S>(this, options)
  }

  useBlocStates<S = BlocState<B>>(options?: {
    selector?: (state: BlocState<B>) => S
    condition?: (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
  }) {
    return useBlocStates<B, S>(this, options)
  }

  watchBlocState<S = BlocState<B>>(
    callback: (
      newState: BlocState<B> | S,
      oldState: BlocState<B> | S | undefined,
    ) => void,
    options?: WatchOptions & {
      selector?: (state: BlocState<B>) => S
      condition?: (
        transition: Transition<BlocState<B>, BlocEvent<B>>,
      ) => boolean
    },
  ) {
    return watchBlocState<B, S>(this, callback, options)
  }

  watchBlocTransition(
    callback: (transition: Transition<BlocState<B>, BlocEvent<B>>) => void,
  ) {
    return watchBlocTransition<B>(this, callback)
  }

  get Provider() {
    type BlocCallbackProp = PropType<() => B | B>
    return defineComponent({
      name: 'BlocProvider',
      props: {
        bloc: {
          type: Function as BlocCallbackProp,
          required: true,
        },
        disposable: {
          type: Boolean as PropType<Boolean>,
          default: false,
        },
      },
      setup: (props, { slots }) => {
        this.provideBloc(props.bloc, props.disposable as boolean)

        const defaultSlot = slots.default ? slots.default : () => {}

        return () => createVNode(Fragment, null, [defaultSlot()])
      },
    })
  }

  get Builder() {
    const builder = defineComponent(
      <S = BlocState<B>>(
        props: {
          selector?: (state: BlocState<B>) => S
          buildWhen?: (
            transition: Transition<BlocState<B>, BlocEvent<B>>,
          ) => boolean
          build?: (
            state: BlocState<B> | S,
            oldState: BlocState<B> | S | undefined,
          ) => VNodeChild
        },
        {
          slots,
        }: SetupContext<
          any,
          SlotsType<{
            default: (
              state: Readonly<any>,
              oldState: Readonly<any> | undefined,
            ) => any
          }>
        >,
      ) => {
        const state = this.useBlocStates<S>({
          selector: props.selector,
          condition: props.buildWhen,
        })
        const defaultSlot = props.build
          ? props.build
          : slots.default
            ? slots.default
            : () => {}

        return () =>
          createVNode(Fragment, null, [
            defaultSlot(state.value[0] as any, state.value[1] as any),
          ])
      },
      {
        name: 'BlocBuilder',
        slots: { Object } as SlotsType<{
          default: (
            state: Readonly<any>,
            oldState: Readonly<any> | undefined,
          ) => any
        }>,
      },
    )

    Object.assign(builder, {
      props: ['build', 'selector', 'buildWhen'],
    })

    return builder
  }

  get Use() {
    return defineComponent({
      name: 'BlocUse',

      setup: (props, { slots }) => {
        const bloc = this.useBloc()

        const defaultSlot = slots.default ? slots.default : (bloc: B) => {}

        return () => createVNode(Fragment, null, [defaultSlot(bloc)])
      },
    })
  }
}

export const createBlocContext = <
  B extends Bloc<BlocState<B>, BlocEvent<B>>,
>() => {
  return new BlocContext<B>()
}
