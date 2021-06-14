import { FormState, FormStatus } from './form-state'
import { Bloc } from '../../bloc'
import {
  FormEvent,
  StatusChanged,
  ResetForm,
  FormValidationError,
  FormSubmitted,
} from './form-event'
import { InputBloc } from './input/input-bloc'
import { FormValidationException } from '../../exceptions/form-validation-exception'
import { SubscriptionsContainer } from '../../subscriptions-container'
import { InputState } from './input/input-state';

export abstract class FormBloc extends Bloc<FormState, FormEvent> {
  abstract get fields(): InputBloc<any, any>[]
  readonly subscriptionsContainer = new SubscriptionsContainer()
  readonly invalidFields: Array<InputBloc<any, any>> = []

  constructor() {
    super(
      new FormState({
        status: FormStatus.invalid,
        submitted: false,
      })
    )

    this.initializeFields()
  }

  initializeFields() {
    this.fields.forEach((field) => {
      this.subscriptionsContainer.add = field.subscribe((value: InputState<unknown, unknown>) => {
        if (!value.isValid) {
          this.emitStatusChanged(FormStatus.invalid)
          this.invalidFields.push(field)
        } else {
          const index = this.invalidFields.indexOf(field)
          if (index > -1) {
            this.invalidFields.splice(index, 1)
          }

          if (this.initializeFields.length < 1) {
            this.emitStatusChanged(FormStatus.valid)
          }
        }
      })
    })
  }

  protected async *mapEventToState(event: FormEvent) {
    if (event instanceof StatusChanged) {
      yield this.state.copyWith({
        status: event.status,
      })
    } else if (event instanceof FormSubmitted) {
      yield this.state.copyWith({
        status: event.status,
        submitted: true,
      })
      if (event.resetForm) {
        this.resetForm()
      }
    } else if (event instanceof ResetForm) {
      this.resetForm()
    } else if (event instanceof FormValidationError) {
      this.onValidationError(event.error)
      yield this.state.copyWith({
        status: FormStatus.valid,
      })
    }
  }

  protected resetForm() {
    this.fields.forEach((field) => {
      field.emitResetInput()
    })
  }

  protected onValidationError(error: FormValidationException) {
    error.error.forEach((value, key) => {
      const field = this.fields.find((field) => field.name === key)
      if (field) {
        field.emitInputValidationError(value)
      }
    })
  }

  public emitValidationError(error: FormValidationException) {
    this.add(new FormValidationError(error))
  }

  public emitStatusChanged(status: FormStatus) {
    this.add(new StatusChanged(status))
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
    this.invalidFields.slice(0, this.initializeFields.length)
  }
}
