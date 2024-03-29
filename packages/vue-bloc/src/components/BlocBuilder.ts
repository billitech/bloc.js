import { createVNode, defineComponent, Fragment, SlotsType } from 'vue'
import { Bloc, Transition } from '@billitech/bloc'
import { useBlocState } from '../compositions'
import { PropType } from 'vue'

export const BlocBuilder = defineComponent({
  name: 'BlocBuilder',

  props: {
    bloc: {
      type: Object as PropType<Bloc<any, any>>,
      required: true,
    },
    buildWhen: {
      type: Function as PropType<(transition: Transition<any, any>) => boolean>,
      default: () => true,
    },
  },
  slots: { Object } as SlotsType<{
    default: (state: Readonly<any>) => any
  }>,
  setup(props, { slots }) {
    const state = useBlocState<any>(props.bloc, props.buildWhen)

    const defaultSlot = slots.default
      ? slots.default
      : (state: Readonly<unknown>) => {}

    return () => createVNode(Fragment, null, [defaultSlot(state.value)])
  },
})
