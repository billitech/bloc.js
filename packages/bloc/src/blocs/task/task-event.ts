import { ApiResponse } from '../../api'

export abstract class TaskEvent<R> {
  constructor(readonly response?: ApiResponse<R>) {}
}

export class TaskEventSuccess<R> extends TaskEvent<R> {
  constructor(readonly response: ApiResponse<R>) {
    super(response)
  }
}

export class TaskEventLoading<R> extends TaskEvent<R> {}

export class TaskEventFailure<R> extends TaskEvent<R> {
  constructor(readonly response: ApiResponse<R>) {
    super(response)
  }
}
