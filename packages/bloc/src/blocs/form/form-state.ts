export enum FormStatus {
  valid,
  invalid,
}

export class FormState {
  readonly status: FormStatus
  readonly submitted: boolean

  constructor(payload: { status: FormStatus; submitted: boolean }) {
    this.status = payload.status
    this.submitted = payload.submitted
  }

  copyWith(payload: { status?: FormStatus; submitted?: boolean }) {
    return new FormState({
      status: payload.status ?? this.status,
      submitted: payload.submitted ?? this.submitted,
    })
  }
}
