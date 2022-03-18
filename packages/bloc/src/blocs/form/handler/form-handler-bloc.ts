import { Bloc } from '../../../bloc'
import { FormValidationException } from '../../../exceptions/form-validation-exception'
import { FormBloc } from '../form-bloc'
import { FormStatus } from '../form-state'
import { FormHandlerEvent, ButtonPressed } from './form-handler-event'
import { FormHandlerState, FormHandlerStatus } from './form-handler-state'

export abstract class FormHandlerBloc<F extends FormBloc, R> extends Bloc<
  FormHandlerState<R>,
  FormHandlerEvent
> {
  constructor() {
    super(new FormHandlerState({ status: FormHandlerStatus.initial }))
  }

  protected async *mapEventToState(event: FormHandlerEvent) {
    if (event instanceof ButtonPressed) {
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
        event.form.emitFormSubmitted(FormStatus.valid, true)
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
              error:
                (error as { message: string }).message ?? 'An error occurred',
            })
          } else {
            yield this.state.copyWith({
              status: FormHandlerStatus.failure,
              error: error?.toString() ?? 'An error occurred',
            })
          }
          event.form.emitLoadingChanged(false)
        } else {
          yield this.state.copyWith({
            status: FormHandlerStatus.failure,
            error: error as string,
          })
          event.form.emitLoadingChanged(false)
        }
      }
    }
  }

  abstract handleFormSubmission(form: F): Promise<R> | R

  emitButtonPressed(form: F) {
    this.add(new ButtonPressed(form))
  }
}
