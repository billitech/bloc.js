export abstract class TaskEvent<T> {
  constructor(readonly successData?: T) {}
}

export class TaskEventSuccess<T> extends TaskEvent<T> {
  constructor(readonly successData: T) {
    super()
  }
}

export class TaskEventLoading<T> extends TaskEvent<T> {}

export class TaskEventFailure<T> extends TaskEvent<T> {
  constructor(readonly error: string) {
    super()
  }
}
