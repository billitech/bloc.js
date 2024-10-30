import { DoTask } from './task-handler-event'
import { TaskHandlerState } from './task-handler-state'
import { Bloc } from '../../../bloc'
import { TaskBloc, TaskResponseType } from '../task-bloc'
import {
  getErrorErrors,
  getErrorMessage,
  getErrorResponseCode,
  getErrorStatusCode,
} from '../../../util'
import { ApiResponse } from '../../../api'
import { Optional } from '../../../optional'
import { FormValidationException } from '../../../exceptions'

export abstract class TaskHandlerBloc<
  T extends TaskBloc<R>,
  R = TaskResponseType<T>,
> extends Bloc<TaskHandlerState<T, R>, DoTask<T, R>> {
  constructor() {
    super(new TaskHandlerState())
  }

  protected async *mapEventToState(event: DoTask<T, R>) {
    try {
      yield this.state.copyWith({
        isLoading: Optional.value(true),
        task: Optional.value(event.task),
      })
      event.task.emitLoading()
      const resp = await this.handleTask(event.task)
      yield this.state.copyWith({
        isLoading: Optional.value(false),
        task: Optional.value(event.task),
        response: Optional.value(resp),
      })
      if (!event.task.closed) {
        event.task.emitSuccess(resp)
      }
    } catch (error) {
      if (error instanceof FormValidationException) {
        const resp = error.apiResponse<R>()
        yield this.state.copyWith({
          isLoading: Optional.value(false),
          task: Optional.value(event.task),
          response: Optional.value(resp),
        })
        if (!event.task.closed) {
          event.task.emitFailure(resp)
        }
      } else {
        const resp = this.getUnknownErrorResponse(error)
        yield this.state.copyWith({
          isLoading: Optional.value(false),
          task: Optional.value(event.task),
          response: Optional.value(resp),
        })
        if (!event.task.closed) {
          if (!event.task.closed) {
            event.task.emitFailure(resp)
          }
        }
      }
    }
  }

  abstract handleTask(task: T): Promise<ApiResponse<R>> | ApiResponse<R>

  emitDoTask(task: T) {
    this.add(new DoTask(task))
  }

  protected getUnknownErrorResponse(error: unknown): ApiResponse<R> {
    return {
      status: false,
      responseCode: getErrorResponseCode(error),
      statusCode: getErrorStatusCode(error),
      message: getErrorMessage(error),
      errors: getErrorErrors(error),
      data: null,
    }
  }
}
