import { Bloc } from '../../bloc'
import {
  TaskEvent,
  TaskEventFailure,
  TaskEventLoading,
  TaskEventSuccess,
} from './task-event'
import { TaskState, TaskStatus } from './task-state'

export type TaskSuccessType<T extends TaskBloc<any>> = T['___successType']

export abstract class TaskBloc<T> extends Bloc<TaskState<T>, TaskEvent<T>> {
  get ___successType(): T {
    return {} as T
  }

  abstract get ref(): string | number

  constructor() {
    super(new TaskState())
  }

  protected async *mapEventToState(event: TaskEvent<T>) {
    if (event instanceof TaskEventLoading) {
      yield this.state.copyWith({
        status: TaskStatus.loading,
      })
    } else if (event instanceof TaskEventSuccess) {
      yield this.state.copyWith({
        status: TaskStatus.success,
        successData: event.successData,
      })
    } else if (event instanceof TaskEventFailure) {
      yield this.state.copyWith({
        status: TaskStatus.failure,
        error: event.error,
      })
    }
  }

  emitLoading() {
    this.add(new TaskEventLoading())
  }

  emitSuccess(successData: T) {
    this.add(new TaskEventSuccess(successData))
  }

  emitFailure(error: string) {
    this.add(new TaskEventFailure(error))
  }
}
