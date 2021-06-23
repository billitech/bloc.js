import { Bloc, BlocEvent, BlocState, Transition } from '@billitech/bloc'
import {
  createVNode,
  defineComponent,
  Fragment,
  PropType,
  WatchOptions,
} from 'vue'
import {
  provideBloc,
  useBloc,
  useBlocState,
  watchBlocState,
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
        Date.now().toString(24)
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

  useBlocState(
    condition: (
      transition: Transition<BlocState<B>, BlocEvent<B>>
    ) => boolean = () => true
  ) {
    return useBlocState<B>(this, condition)
  }

  watchBlocState(
    callback: (
      newState: BlocState<B>,
      oldState: BlocState<B> | undefined
    ) => void,
    option?: WatchOptions
  ) {
    return watchBlocState<B>(this, callback, option)
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
        const { bloc, disposable } = props
        this.provideBloc(bloc, disposable as boolean)

        const defaultSlot = slots.default ? slots.default : () => {}

        return () => createVNode(Fragment, null, [defaultSlot()])
      },
    })
  }

  get Builder() {
    return defineComponent({
      name: 'BlocBuilder',

      props: {
        buildWhen: {
          type: Function as PropType<
            (transition: Transition<BlocState<B>, BlocEvent<B>>) => boolean
          >,
          default: () => true,
        },
      },

      setup: (props, { slots }) => {
        const { buildWhen } = props

        const state = this.useBlocState(buildWhen)

        const defaultSlot = slots.default
          ? slots.default
          : (state: Readonly<BlocState<B>>) => {}

        return () => createVNode(Fragment, null, [defaultSlot(state.value)])
      },
    })
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
  B extends Bloc<BlocState<B>, BlocEvent<B>>
>() => {
  return new BlocContext<B>()
}
