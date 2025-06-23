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

export type FormBlocResponseType<R extends FormBloc<any>> = R['___responseType']

export abstract class FormBloc<R = any> extends Bloc<FormState<R>, FormEvent> {
  get ___responseType(): R {
    return {} as R
  }

  abstract get fields(): InputBloc<any, any>[]
  readonly subscriptionsContainer = new SubscriptionsContainer()
  readonly id: string

  constructor(readonly initDelayMs = 0.5) {
    super(
      new FormState({
        isValid: false,
        isValidating: false,
        isLoading: false,
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
    const isValid = field.state.isInvalid
      ? false
      : this.fields.filter(
          (field2) => field2.state.isInvalid && field2 !== field,
        ).length == 0

    const isValidating = field.state.isValidating
      ? true
      : this.fields.filter(
          (field2) => field2.state.isValidating && field2 !== field,
        ).length > 0

    this.emitValidChanged(isValid, isValidating)
  }

  protected *mapEventToState(event: FormEvent) {
    if (event instanceof FormValidChanged) {
      yield this.state.copyWith({
        isValid: Optional.value(event.isValid),
        isValidating: Optional.value(event.isValidating),
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
        isLoading: Optional.value(false),
        response: Optional.value(event.response),
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

  public emitValidChanged(isValid: boolean, isValidating: boolean) {
    this.add(new FormValidChanged(isValid, isValidating))
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
