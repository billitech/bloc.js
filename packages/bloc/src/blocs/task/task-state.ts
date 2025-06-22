import { ApiResponse } from '../../api'
import { Equatable } from '../../equatable'
import { Optional } from '../../optional'

export enum TaskStatus {
  Initial = 'initial',
  Loading = 'loading',
  Failure = 'failure',
  Success = 'success',
}

export class TaskState<R = any> extends Equatable {
  readonly isLoading: boolean
  readonly response?: ApiResponse<R>

  constructor({
    isLoading = false,
    response,
  }: { isLoading?: boolean; response?: ApiResponse<R> } = {}) {
    super()
    this.isLoading = isLoading
    this.response = response
  }

  copyWith({
    isLoading,
    response,
  }: {
    isLoading?: Optional<boolean>
    response?: Optional<ApiResponse<R> | undefined>
  }): TaskState<R> {
    return new TaskState<R>({
      isLoading:
        isLoading && isLoading.isValid ? isLoading.value : this.isLoading,
      response: response && response.isValid ? response.value : this.response,
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

  get status(): TaskStatus {
    if (this.isLoading) {
      return TaskStatus.Loading
    }
    if (this.isSuccess) {
      return TaskStatus.Success
    }
    if (this.isFailure) {
      return TaskStatus.Failure
    }
    return TaskStatus.Initial
  }

  get props(): any[] {
    return [this.isLoading, this.response]
  }
}
