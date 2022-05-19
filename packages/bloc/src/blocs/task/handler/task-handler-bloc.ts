import { DoTask } from './task-handler-event'
import { TaskHandlerState, TaskHandlerStatus } from './task-handler-state'
import { Bloc } from '../../../bloc'
import { TaskBloc, TaskSuccessType } from '../task-bloc'
import { getErrorMessage } from '../../../util'

export abstract class TaskHandlerBloc<
  T extends TaskBloc<R>,
  R = TaskSuccessType<T>
> extends Bloc<TaskHandlerState<R>, DoTask<T, R>> {
  constructor() {
    super(new TaskHandlerState({ status: TaskHandlerStatus.initial }))
  }

  protected async *mapEventToState(event: DoTask<T, R>) {
    try {
      yield this.state.copyWith({
        status: TaskHandlerStatus.loading,
        ref: event.task.ref,
      })
      event.task.emitLoading()
      const res = await this.handleTask(event.task)
      yield this.state.copyWith({
        status: TaskHandlerStatus.success,
        successData: res,
        ref: event.task.ref,
      })
      event.task.emitSuccess(res)
    } catch (error) {
      yield this.state.copyWith({
        status: TaskHandlerStatus.failure,
        error: getErrorMessage(error),
        ref: event.task.ref,
      })
    }
  }

  abstract handleTask(task: T): Promise<R> | R

  emitDoTask(task: T) {
    this.add(new DoTask(task))
  }
}
