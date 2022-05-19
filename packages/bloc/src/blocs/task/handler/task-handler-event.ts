import { TaskBloc } from "../task-bloc";

export class DoTask<T extends TaskBloc<R>, R> {
  constructor(public readonly task: T) {}
}
