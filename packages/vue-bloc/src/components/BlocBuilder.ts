import {
  createVNode,
  defineComponent,
  Fragment,
  SetupContext,
  SlotsType,
  VNodeChild,
} from 'vue'
import {
  Bloc,
  type BlocEvent,
  type BlocState,
  Transition,
} from '@billitech/bloc'
import { useBlocState, useBlocStates } from '../compositions'

export const BlocBuilder = defineComponent(
  <
    B extends Bloc<BlocState<B>, BlocEvent<B>> = Bloc<any, any>,
    S = BlocState<B>,
  >(
    props: {
      bloc: B
      selector?: (state: BlocState<B>) => S
      buildWhen?: (
        transition: Transition<BlocState<B>, BlocEvent<B>>,
      ) => boolean
      build?: (state: S, oldState: S | undefined) => VNodeChild
    },
    {
      slots,
    }: SetupContext<
      any,
      SlotsType<{
        default: (state: Readonly<S>, oldState: Readonly<S> | undefined) => any
      }>
    >,
  ) => {
    const state = useBlocStates<B, S>(props.bloc, {
      selector: props.selector,
      condition: props.buildWhen,
    })
    const defaultSlot = props.build
      ? props.build
      : slots.default
        ? slots.default
        : (state: Readonly<S>, oldState: Readonly<S> | undefined) => {}

    return () =>
      createVNode(Fragment, null, [defaultSlot(state.value[0], state.value[1])])
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

Object.assign(BlocBuilder, {
  props: ['bloc', 'build', 'selector', 'buildWhen'],
})
