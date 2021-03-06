import { Bloc, BlocEvent, BlocState, Transition } from '@billitech/bloc'
import {
  createVNode,
  DeepReadonly,
  defineComponent,
  Fragment,
  PropType,
} from 'vue'
import { provideBloc, useBloc, useBlocState } from './compositions'

export class BlocContext<B extends Bloc<BlocState<B>, BlocEvent<B>>> {
  private readonly _ID

  constructor() {
    this._ID = this.createID()
  }

  private createID() {
    return (
      Array(16)
        .fill(0)
        .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
        .join('') + Date.now().toString(24)
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

  get Provider() {
    type BlocCallbackProp = PropType<() => B>
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

        const [state, dispatch] = this.useBlocState(buildWhen)

        const defaultSlot = slots.default
          ? slots.default
          : (state: DeepReadonly<BlocState<B>>) => {}

        return () => createVNode(Fragment, null, [defaultSlot(state.value)])
      },

      render() {},
    })
  }
}

export const createBlocContext = <
  B extends Bloc<BlocState<B>, BlocEvent<B>>
>() => {
  return new BlocContext<B>()
}
