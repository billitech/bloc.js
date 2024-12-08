import {
  createVNode,
  defineComponent,
  Fragment,
  SetupContext,
  SlotsType,
} from 'vue'
import {
  Bloc,
  type BlocEvent,
  type BlocState,
  Transition,
} from '@billitech/bloc'
import { useBlocState } from '../compositions'

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
    },
    {
      slots,
    }: SetupContext<
      any,
      SlotsType<{
        default: (state: Readonly<any>) => any
      }>
    >,
  ) => {
    const state = useBlocState<B, S>(props.bloc, {
      selector: props.selector,
      condition: props.buildWhen,
    })
    const defaultSlot = slots.default
      ? slots.default
      : (state: Readonly<S>) => {}

    return () => createVNode(Fragment, null, [defaultSlot(state.value)])
  },
  {
    name: 'BlocBuilder',
    slots: { Object } as SlotsType<{
      default: (state: Readonly<any>) => any
    }>,
  },
)

Object.assign(BlocBuilder, {
  props: ['bloc', 'buildWhen'],
})
