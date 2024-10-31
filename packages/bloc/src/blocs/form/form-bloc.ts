import { FormState } from './form-state'
import { Bloc } from '../../bloc'
import {
  FormEvent,
  ResetForm,
  FormValidationError,
  FormSubmitted,
  ValidateForm,
  FormLoadingChanged,
  FormValidChanged,
} from './form-event'
import { InputBloc } from './input/input-bloc'
import { FormValidationException } from '../../exceptions/form-validation-exception'
import { SubscriptionsContainer } from '../../subscriptions-container'
import { debounceTime, distinct } from 'rxjs'
import { Optional } from '../../optional'
import { ApiResponse } from '../../api'

export abstract class FormBloc extends Bloc<FormState, FormEvent> {
  abstract get fields(): InputBloc<any, any>[]
  readonly subscriptionsContainer = new SubscriptionsContainer()
  readonly id: string

  constructor(readonly initDelayMs = 0.5) {
    super(
      new FormState({
        isValid: false,
        isLoading: false,
        isSubmitted: false,
      }),
    )
    this.id = `${(Math.random() + 1).toString(36).substring(7)}-${(
      Math.random() + 1
    )
      .toString(36)
      .substring(7)}`
    setTimeout(() => this.initializeFields(), initDelayMs)
  }

  initializeFields() {
    this.fields.forEach((field) => {
      this.subscriptionsContainer.add = field.stream
        .pipe(debounceTime(500), distinct())
        .subscribe((_) => {
          this.validateField(field)
        })
    })
  }

  protected validateField(field: InputBloc<unknown, unknown>) {
    if (field.state.isInvalid) {
      this.emitValidChanged(false)
    } else {
      const invalids = this.fields.filter(
        (field2) => field2.state.isInvalid && field2 !== field,
      )
      if (invalids.length == 0) {
        this.emitValidChanged(true)
      }
    }
  }

  protected async *mapEventToState(event: FormEvent) {
    if (event instanceof FormValidChanged) {
      yield this.state.copyWith({
        isValid: Optional.value(event.isValid),
      })
    } else if (event instanceof FormLoadingChanged) {
      yield this.state.copyWith({
        isLoading: Optional.value(event.loading),
      })
    } else if (event instanceof FormSubmitted) {
      this.onValidationError(event.response.errors ?? {})
      yield this.state.copyWith({
        isValid: Optional.value(
          !event.response.errors ||
            Object.keys(event.response.errors).length == 0,
        ),
        isSubmitted: Optional.value(event.response.status),
        isLoading: Optional.value(false),
      })
      if (event.response.status && event.resetForm) {
        this.resetForm()
      }
    } else if (event instanceof ValidateForm) {
      this.validateForm()
    } else if (event instanceof ResetForm) {
      this.resetForm()
    } else if (event instanceof FormValidationError) {
      this.onValidationError(event.error.errors)
      yield this.state.copyWith({
        isValid: Optional.value(false),
        isLoading: Optional.value(false),
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
      field.emitInputUnFocused({ forceError: true })
    })
  }

  protected onValidationError(errors: Record<string, string>) {
    for (const key in errors) {
      const field = this.fields.find((field) => field.name === key)
      if (field && errors[key] !== null && errors[key] !== undefined) {
        field.emitInputValidationError(errors[key])
      }
    }
  }

  public emitValidationError(error: FormValidationException) {
    this.add(new FormValidationError(error))
  }

  public emitValidateForm() {
    this.add(new ValidateForm())
  }

  public emitValidChanged(isValid: boolean) {
    this.add(new FormValidChanged(isValid))
  }

  public emitLoadingChanged(loading: boolean) {
    this.add(new FormLoadingChanged(loading))
  }

  public emitFormSubmitted(payload: {
    response: ApiResponse<any>
    resetForm?: boolean
  }) {
    this.add(new FormSubmitted(payload))
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
