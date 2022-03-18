export enum FormStatus {
  valid,
  invalid,
}

export class FormState {
  readonly status: FormStatus
  readonly loading: boolean
  readonly submitted: boolean

  constructor(payload: { status: FormStatus; submitted: boolean; loading: boolean }) {
    this.status = payload.status
    this.submitted = payload.submitted
    this.loading = payload.loading
  }

  copyWith(payload: { status?: FormStatus; submitted?: boolean, loading?: boolean }) {
    return new FormState({
      status: payload.status ?? this.status,
      submitted: payload.submitted ?? this.submitted,
      loading: payload.loading ?? this.loading,
    })
  }

  get valid(): boolean {
    return this.status === FormStatus.valid
  }

  get invalid(): boolean {
    return this.status === FormStatus.invalid
  }
}
