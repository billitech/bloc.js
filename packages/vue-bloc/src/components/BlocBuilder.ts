import { createVNode, defineComponent, Fragment } from 'vue'
import { Bloc, Transition } from '@billitech/bloc'
import { useBlocState } from '../compositions'
import { PropType } from 'vue'

export const BlocBuilder = defineComponent({
  name: 'BlocBuilder',

  props: {
    bloc: {
      type: Object as PropType<Bloc<any, any>>,
      required: false,
    },
    buildWhen: {
      type: Function as PropType<(transition: Transition<any, any>) => boolean>,
      default: () => true,
    },
  },

  setup(props, { slots }) {
    const { bloc, buildWhen } = props

    const [state] = useBlocState<any>(bloc, buildWhen)

    const defaultSlot = slots.default ? slots.default : (state: Readonly<unknown>) => {}

    return () => createVNode(Fragment, null, [defaultSlot(state.value)])
  },
})
