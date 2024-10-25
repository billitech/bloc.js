import { ApiResponse } from '../../../api'
import { Bloc } from '../../../bloc'
import { FormValidationException } from '../../../exceptions/form-validation-exception'
import { Optional } from '../../../optional'
import { getErrorMessage } from '../../../util'
import { FormBloc } from '../form-bloc'
import { SubmitForm } from './form-handler-event'
import { FormHandlerState } from './form-handler-state'

export abstract class FormHandlerBloc<F extends FormBloc, R> extends Bloc<
  FormHandlerState<R>,
  SubmitForm<F>
> {
  constructor(readonly resetOnSuccess = false) {
    super(new FormHandlerState())
  }

  protected async *mapEventToState(event: SubmitForm<F>) {
    try {
      yield this.state.copyWith({
        isLoading: Optional.value(true),
      })
      event.form.emitLoadingChanged(true)

      const resp = await this.handleFormSubmission(event.form)
      yield this.state.copyWith({
        isLoading: Optional.value(false),
        response: Optional.value(resp),
      })
      if (!event.form.closed) {
        event.form.emitFormSubmitted({
          response: resp,
          resetForm: resp.status ? this.resetOnSuccess : false,
        })
      }
    } catch (error) {
      if (error instanceof FormValidationException) {
        yield this.state.copyWith({
          isLoading: Optional.value(false),
          response: Optional.value(error.apiResponse<R>()),
        })

        if (!event.form.closed) {
          event.form.emitValidationError(error)
        }
      } else {
        const resp = this.getUnknownErrorResponse(error)
        yield this.state.copyWith({
          isLoading: Optional.value(false),
          response: Optional.value(resp),
        })
        if (!event.form.closed) {
          event.form.emitFormSubmitted({
            response: resp,
            resetForm: false,
          })
        }
      }
    }
  }

  abstract handleFormSubmission(
    form: F,
  ): Promise<ApiResponse<R>> | ApiResponse<R>

  emitSubmitForm(form: F): void {
    this.add(new SubmitForm(form))
  }

  protected getUnknownErrorResponse(error: unknown): ApiResponse<R> {
    return {
      status: false,
      responseCode: '',
      message: getErrorMessage(error),
      data: null,
      errors: null,
    }
  }
}
