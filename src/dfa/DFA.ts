import BaseAutomaton from '../BaseAutomaton';

import DFAState from './DFAState';
import DFATransition from './DFATransition';

import BaseAutomatonError from '../errors/BaseAutomatonError';
import AutomatonInvalidStartStateError from '../errors/AutomatonInvalidStartStateError';
import AutomatonInvalidAcceptStateError from '../errors/AutomatonInvalidAcceptStateError';
import AutomatonStateWrongNumTransitionsError from '../errors/AutomatonStateWrongNumTransitionsError';
import AutomatonTransitionInvalidCurrentStateError from '../errors/AutomatonTransitionInvalidCurrentStateError';
import AutomatonTransitionInvalidTargetStateError from '../errors/AutomatonTransitionInvalidTargetStateError';
import AutomatonTransitionInvalidInputTokenError from '../errors/AutomatonTransitionInvalidInputTokenError';

export default class DFA extends BaseAutomaton {
  public states: Array<DFAState> = [];
  public inputAlphabet: Array<string> = [];
  public transitions: Array<DFATransition> = [];
  public startState: DFAState | null = null;
  public acceptStates: Array<DFAState> = [];

  constructor() {
    super();
  }

  private stateIsValid(state: DFAState | null): boolean {
    return state !== undefined && state !== null && this.states.includes(state);
  }

  private transitionsForCurrentState(state: DFAState): Array<DFATransition> {
    return this.transitions.filter(t => t.currentState === state);
  }

  public getErrors(): Array<BaseAutomatonError> {
    const errors = Array<BaseAutomatonError>();

    // Confirm the accept state is valid.
    if (!this.stateIsValid(this.startState)) {
      errors.push(new AutomatonInvalidStartStateError(this.startState, this));
    }

    // Confirm all accept states are valid.
    this.acceptStates.forEach(s => {
      if (!this.stateIsValid(s)) {
        errors.push(new AutomatonInvalidAcceptStateError(s, this));
      }
    });

    // Confirm all transitions are valid.
    errors.push(...this.verifyTransitions());

    return errors;
  }

  verifyTransitions(): Array<BaseAutomatonError> {
    const errors = Array<BaseAutomatonError>();

    // First, verify that each individual transition is valid within the
    // DFA - that it has valid current and target states, and that its
    // input token is in the alphabet.
    for (let i = 0; i < this.transitions.length; i++) {
      const tr = this.transitions[i];
      errors.push(...this.verifyTransition(tr));
    }

    // We also need to verify that, for each State in the DFA,
    // there is exactly one Transition per input token (no more, no less).
    for (let stateIdx = 0; stateIdx < this.states.length; stateIdx++) {
      const transitionsForCurrentState =
        this.transitionsForCurrentState(this.states[stateIdx]);

      for (let tkIdx = 0; tkIdx < this.inputAlphabet.length; tkIdx++) {
        const token = this.inputAlphabet[tkIdx];
        const numTransWithToken = transitionsForCurrentState.filter(
          t => t.inputToken === token
        ).length;
        if (numTransWithToken !== 1) {
          errors.push(
            new AutomatonStateWrongNumTransitionsError(
              this.states[stateIdx],
              numTransWithToken,
              token
            )
          );
        }
      }
    }

    return errors;
  }

  private verifyTransition(tr: DFATransition): Array<BaseAutomatonError> {
    const errors = Array<BaseAutomatonError>();

    // Check currentState
    if (!this.stateIsValid(tr.currentState)) {
      errors.push(new AutomatonTransitionInvalidCurrentStateError(tr));
    }

    // Check nextState
    if (!this.stateIsValid(tr.targetState)) {
      errors.push(new AutomatonTransitionInvalidTargetStateError(tr));
    }

    // Check valid input token
    if (!this.inputAlphabet.includes(tr.inputToken)) {
      errors.push(new AutomatonTransitionInvalidInputTokenError(tr));
    }

    return errors;
  }
}
