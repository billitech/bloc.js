import { Equatable } from "../../../equatable"

export enum TaskHandlerStatus {
  initial,
  loading,
  failure,
  success,
}

export class TaskHandlerState<R> extends Equatable {
  readonly status: TaskHandlerStatus
  readonly successData: R | null
  readonly error: string | null
  readonly ref: string | number | null

  constructor(payload: {
    status?: TaskHandlerStatus | null
    successData?: R | null
    error?: string | null
    ref?: string | number | null
  }) {
    super()
    this.status = payload.status ?? TaskHandlerStatus.initial
    this.successData = payload.successData ?? null
    this.error = payload.error ?? null
    this.ref = payload.ref ?? null
  }

  copyWith(payload: {
    status: TaskHandlerStatus
    successData?: R | null
    error?: string | null
    ref?: string | number | null
  }): TaskHandlerState<R> {
    return new TaskHandlerState<R>({
      status: payload.status ?? this.status,
      successData:
        payload.successData === undefined
          ? null
          : payload.successData ?? this.successData,
      error: payload.error === undefined ? null : payload.error ?? this.error,
      ref: payload.ref === undefined ? null : payload.ref ?? this.ref,
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
    return [this.status, this.successData, this.error, this.ref]
  }
}
