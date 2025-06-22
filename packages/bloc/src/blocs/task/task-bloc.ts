import { ApiResponse } from '../../api'
import { Bloc } from '../../bloc'
import { Optional } from '../../optional'
import {
  TaskEvent,
  TaskEventFailure,
  TaskEventLoading,
  TaskEventSuccess,
} from './task-event'
import { TaskState } from './task-state'

export type TaskBlocResponseType<R extends TaskBloc<any>> = R['___responseType']

export abstract class TaskBloc<R> extends Bloc<TaskState<R>, TaskEvent<R>> {
  get ___responseType(): R {
    return {} as R
  }

  abstract get id(): string | number

  constructor() {
    super(new TaskState())
  }

  protected *mapEventToState(event: TaskEvent<R>) {
    if (event instanceof TaskEventLoading) {
      yield this.state.copyWith({
        isLoading: Optional.value(true),
      })
    } else if (event instanceof TaskEventSuccess) {
      yield this.state.copyWith({
        isLoading: Optional.value(false),
        response: Optional.value(event.response),
      })
    } else if (event instanceof TaskEventFailure) {
      yield this.state.copyWith({
        isLoading: Optional.value(false),
        response: Optional.value(event.response),
      })
    }
  }

  emitLoading() {
    this.add(new TaskEventLoading())
  }

  emitSuccess(response: ApiResponse<R>) {
    this.add(new TaskEventSuccess(response))
  }

  emitFailure(response: ApiResponse<R>) {
    this.add(new TaskEventFailure(response))
  }
}
