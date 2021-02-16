import { Bloc } from './index'
import { Transition } from './transition'
import { BlocState, BlocEvent } from './bloc';

export class BlocObserver<B extends Bloc<any, any>> {
  
  onEvent(_bloc: Bloc<BlocState<B>, BlocEvent<B>>, _event: BlocEvent<B>): void {
    return
  }
 
  onTransition(_bloc: Bloc<BlocState<B>,  BlocEvent<B>>, _transition: Transition<BlocState<B>,  BlocEvent<B>>): void {
    return
  }

  onError(_bloc: Bloc<BlocState<B>,  BlocEvent<B>>, _error: any): void {
    return
  }
}