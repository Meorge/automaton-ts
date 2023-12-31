import BaseAutomatonError from './BaseAutomatonError';
import DFA from '../dfa/DFA';
import AutomatonState from '../AutomatonState';
import BaseAutomaton from '../BaseAutomaton';
export default class AutomatonInvalidAcceptStateError<T extends BaseAutomaton> extends BaseAutomatonError {
  constructor(
    private state: AutomatonState<T> | null,
    private automaton: BaseAutomaton
  ) {
    super();
  }

  override errorString(): string {
    return `Accept state ${this.state} is invalid`;
  }
}
