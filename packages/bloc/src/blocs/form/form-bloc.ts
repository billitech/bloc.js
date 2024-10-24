import { FormState, FormStatus } from './form-state'
import { Bloc } from '../../bloc'
import {
  FormEvent,
  StatusChanged,
  ResetForm,
  FormValidationError,
  FormSubmitted,
  ValidateForm,
  LoadingChanged,
} from './form-event'
import { InputBloc } from './input/input-bloc'
import { FormValidationException } from '../../exceptions/form-validation-exception'
import { SubscriptionsContainer } from '../../subscriptions-container'

export abstract class FormBloc extends Bloc<FormState, FormEvent> {
  abstract get fields(): InputBloc<any, any>[]
  readonly subscriptionsContainer = new SubscriptionsContainer()
  readonly id: string

  constructor() {
    super(
      new FormState({
        status: FormStatus.invalid,
        submitted: false,
        loading: false,
      }),
    )
    this.id = `${(Math.random() + 1).toString(36).substring(7)}-${(
      Math.random() + 1
    )
      .toString(36)
      .substring(7)}`
    setTimeout(() => this.initializeFields(), 0.5)
  }

  initializeFields() {
    this.fields.forEach((field) => {
      this.subscriptionsContainer.add = field.subscribe(() => {
        this.validateField(field)
      })
    })
  }

  protected validateField(field: InputBloc<unknown, unknown>) {
    if (field.state.invalid) {
      this.emitStatusChanged(FormStatus.invalid)
    } else {
      const invalids = this.fields.filter(
        (field2) => field2.state.invalid && field2 !== field,
      )
      if (invalids.length < 1) {
        this.emitStatusChanged(FormStatus.valid)
      }
    }
  }

  protected async *mapEventToState(event: FormEvent) {
    if (event instanceof StatusChanged) {
      yield this.state.copyWith({
        status: event.status,
      })
    } else if (event instanceof LoadingChanged) {
      yield this.state.copyWith({
        loading: event.loading,
      })
    } else if (event instanceof FormSubmitted) {
      yield this.state.copyWith({
        status: event.status,
        submitted: true,
        loading: false,
      })
      if (event.resetForm) {
        this.resetForm()
      }
    } else if (event instanceof ValidateForm) {
      this.validateForm()
    } else if (event instanceof ResetForm) {
      this.resetForm()
    } else if (event instanceof FormValidationError) {
      this.onValidationError(event.error)
      yield this.state.copyWith({
        status: FormStatus.valid,
        loading: false,
      })
    }
  }

  protected resetForm() {
    this.fields.forEach((field) => {
      field.emitResetInput()
    })
  }

  protected validateForm() {
    this.fields.forEach((field) => {
      field.emitInputUnFocused()
    })
  }

  protected onValidationError(error: FormValidationException) {
    for (const key in error.error) {
      const field = this.fields.find((field) => field.name === key)
      if (field) {
        field.emitInputValidationError(error.error[key])
      }
    }
  }

  public emitValidationError(error: FormValidationException) {
    this.add(new FormValidationError(error))
  }

  public emitValidateForm() {
    this.add(new ValidateForm())
  }

  public emitStatusChanged(status: FormStatus) {
    this.add(new StatusChanged(status))
  }

  public emitLoadingChanged(loading: boolean) {
    this.add(new LoadingChanged(loading))
  }

  public emitFormSubmitted(status: FormStatus, resetForm: boolean) {
    this.add(new FormSubmitted(status, resetForm))
  }

  public emitResetForm() {
    this.add(new ResetForm())
  }

  dispose() {
    super.dispose()
    this.subscriptionsContainer.dispose()
    this.fields.forEach((field) => field.dispose())
  }
}
