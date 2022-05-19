import { Equatable } from "../../equatable"

export enum TaskStatus {
  initial,
  loading,
  failure,
  success,
}

export class TaskState<T> extends Equatable {
  readonly status: TaskStatus
  readonly successData: T | null
  readonly error: string | null

  constructor(payload?: {
    status?: TaskStatus | null
    successData?: T | null
    error?: string | null
  }) {
    super()
    this.status = payload?.status ?? TaskStatus.initial
    this.successData = payload?.successData ?? null
    this.error = payload?.error ?? null
  }

  copyWith(payload: {
    status: TaskStatus
    successData?: T | null
    error?: string | null
  }): TaskState<T> {
    return new TaskState<T>({
      status: payload.status ?? this.status,
      successData:
        payload.successData === undefined
          ? null
          : payload.successData ?? this.successData,
      error: payload.error === undefined ? null : payload.error ?? this.error,
    })
  }

  get isInitial(): boolean {
    return this.status === TaskStatus.initial
  }

  get isLoading(): boolean {
    return this.status === TaskStatus.loading
  }

  get isSuccess(): boolean {
    return (
      this.status == TaskStatus.success && this.successData !== undefined
    )
  }

  get isFailure(): boolean {
    return this.status == TaskStatus.failure && this.error !== undefined
  }

  get props(): unknown[] {
    return [this.status, this.successData, this.error]
  }
}
