import type { ApiResponse } from '../../../api'
import { Optional } from '../../../optional'

export enum TaskHandlerStatus {
  Initial = 'initial',
  Loading = 'loading',
  Failure = 'failure',
  Success = 'success',
}

export class TaskHandlerState<T, R> {
  readonly isLoading: boolean
  readonly response?: ApiResponse<R> & { __taskId: string | number }
  readonly task?: T

  constructor({
    isLoading = false,
    response,
    task,
  }: {
    isLoading?: boolean
    response?: ApiResponse<R> & { __taskId: string | number }
    task?: T
  } = {}) {
    this.isLoading = isLoading
    this.response = response
    this.task = task
  }

  copyWith({
    isLoading,
    response,
    task,
  }: {
    isLoading?: Optional<boolean>
    response?: Optional<
      (ApiResponse<R> & { __taskId: string | number }) | undefined
    >
    task?: Optional<T | undefined>
  }): TaskHandlerState<T, R> {
    return new TaskHandlerState<T, R>({
      isLoading:
        isLoading && isLoading.isValid ? isLoading.value : this.isLoading,
      response: response && response.isValid ? response.value : this.response,
      task: task && task.isValid ? task.value : this.task,
    })
  }

  get isInitial(): boolean {
    return this.response === undefined && !this.isLoading
  }

  get isSuccess(): boolean {
    return (
      this.response !== undefined &&
      !this.isLoading &&
      this.response?.status === true
    )
  }

  get isFailure(): boolean {
    return (
      this.response !== undefined &&
      !this.isLoading &&
      this.response?.status !== true
    )
  }

  get isValidationFailure(): boolean {
    return (
      this.isFailure &&
      this.response?.errors !== undefined &&
      Object.keys(this.response.errors ?? {}).length > 0
    )
  }

  get status(): TaskHandlerStatus {
    if (this.isLoading) {
      return TaskHandlerStatus.Loading
    }
    if (this.isSuccess) {
      return TaskHandlerStatus.Success
    }
    if (this.isFailure) {
      return TaskHandlerStatus.Failure
    }
    return TaskHandlerStatus.Initial
  }

  get props(): any[] {
    return [this.isLoading, this.response]
  }
}
