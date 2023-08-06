import { Equatable } from '../../../equatable'

export enum TaskHandlerStatus {
  initial,
  loading,
  failure,
  success,
}

export class TaskHandlerState<T, R> extends Equatable {
  readonly status: TaskHandlerStatus
  readonly successData: R | null
  readonly error: string | null
  readonly id: string | number | null
  readonly task: T | null

  constructor(payload: {
    status?: TaskHandlerStatus | null
    successData?: R | null
    task?: T | null
    error?: string | null
    id?: string | number | null
  }) {
    super()
    this.status = payload.status ?? TaskHandlerStatus.initial
    this.successData = payload.successData ?? null
    this.task = payload.task ?? null
    this.error = payload.error ?? null
    this.id = payload.id ?? null
  }

  copyWith(payload: {
    status: TaskHandlerStatus
    successData?: R | null
    task?: T | null
    error?: string | null
    id?: string | number | null
  }): TaskHandlerState<T, R> {
    return new TaskHandlerState<T, R>({
      status: payload.status ?? this.status,
      successData:
        payload.successData === undefined
          ? null
          : payload.successData ?? this.successData,
      task: payload.task === undefined ? null : payload.task ?? this.task,
      error: payload.error === undefined ? null : payload.error ?? this.error,
      id: payload.id === undefined ? null : payload.id ?? this.id,
    })
  }

  get isInitial(): boolean {
    return this.status === TaskHandlerStatus.initial
  }

  get isLoading(): boolean {
    return this.status === TaskHandlerStatus.loading
  }

  get isSuccess(): boolean {
    return (
      this.status == TaskHandlerStatus.success && this.successData !== undefined
    )
  }

  get isFailure(): boolean {
    return this.status == TaskHandlerStatus.failure && this.error !== undefined
  }

  get props(): unknown[] {
    return [this.status, this.successData, this.error, this.id]
  }
}
