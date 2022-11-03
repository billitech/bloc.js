import { Bloc } from '../../../bloc'
import { FormValidationException } from '../../../exceptions/form-validation-exception'
import { FormBloc } from '../form-bloc'
import { FormStatus } from '../form-state'
import { ButtonPressed } from './form-handler-event'
import { FormHandlerState, FormHandlerStatus } from './form-handler-state'

export abstract class FormHandlerBloc<F extends FormBloc, R> extends Bloc<
  FormHandlerState<R>,
  ButtonPressed<F>
> {
  constructor(readonly resetOnSuccess = false) {
    super(new FormHandlerState({ status: FormHandlerStatus.initial }))
  }

  protected async *mapEventToState(event: ButtonPressed<F>) {
    try {
      yield this.state.copyWith({
        status: FormHandlerStatus.loading,
      })
      event.form.emitLoadingChanged(true)
      const res = await this.handleFormSubmission(event.form)
      yield this.state.copyWith({
        status: FormHandlerStatus.success,
        successData: res,
      })
      event.form.emitFormSubmitted(FormStatus.valid, this.resetOnSuccess)
    } catch (error) {
      if (error instanceof FormValidationException) {
        yield this.state.copyWith({
          status: FormHandlerStatus.failure,
          error: error.message,
          validationError: error,
        })

        event.form.emitValidationError(error)
      } else if (typeof error == 'object') {
        if (error !== null && 'message' in error) {
          yield this.state.copyWith({
            status: FormHandlerStatus.failure,
            validationError: null,
            error:
              (error as { message: string }).message ?? 'An error occurred',
          })
        } else if (error !== null && 'error' in error) {
          yield this.state.copyWith({
            status: FormHandlerStatus.failure,
            validationError: null,
            error: (error as { error: string }).error ?? 'An error occurred',
          })
        } else {
          yield this.state.copyWith({
            status: FormHandlerStatus.failure,
            error: error?.toString() ?? 'An error occurred',
            validationError: null,
          })
        }
        event.form.emitLoadingChanged(false)
      } else {
        yield this.state.copyWith({
          status: FormHandlerStatus.failure,
          error: error as string,
          validationError: null,
        })
        event.form.emitLoadingChanged(false)
      }
    }
  }

  abstract handleFormSubmission(form: F): Promise<R> | R

  emitButtonPressed(form: F) {
    this.add(new ButtonPressed(form))
  }
}
