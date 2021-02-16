import { Bloc } from './bloc'
import { Transition } from './transition'

export class BlocObserver {
  onEvent(_bloc: Bloc<any, any>, _event: any): void {
    return
  }

  onTransition(_bloc: Bloc<any, any>, _transition: Transition<any, any>): void {
    return
  }

  onError(_bloc: Bloc<any, any>, _error: any): void {
    return
  }
}
