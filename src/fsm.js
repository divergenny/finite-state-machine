class FSM {
    constructor(config) {
        this.config = config;
        this.state = config.initial;
        this.stackOfStates = [["normal", null, null, 1]]; //pattern [data, prev, next, length]
        this.getStatesArr = [];
        this.undoState = config.initial;
        this.undoIndex = 0;
        this.errCount = 0;
    
        if (config == null) {
          throw new Error("config isn't passed");
        }
      }
    
      getState() {
        return this.state;
      }

      changeState(state) {
        if (state in this.config.states) {
          this.stackOfStates.push([
            state,
            this.state,
            null,
            this.stackOfStates.length + 1
          ]);
          this.state = state;
          this.stackOfStates[this.stackOfStates.length - 2][2] = this.state; // next value for previous value
    
          for (let i = 0; i < this.undoIndex; i++) {
            this.stackOfStates.pop();
          }
    
          this.undoIndex = 0;
        } else {
          throw new Error("Error");
        }
        return this.state;
      }
 
      trigger(event) {
        if (this.state === "error") {
          throw new Error("event in current state isn't exist");
        }
    
        for (let key in this.config.states) {
          for (let transitionKey in this.config.states[key].transitions) {
            if (event == transitionKey) {
              this.errCount++;
              for (let i = 0; i < this.undoIndex; i++) {
                this.stackOfStates.pop();
              }
              this.undoIndex = 0;
    
              this.stackOfStates.push([
                this.config.states[key].transitions[event],
                this.state,
                null,
                this.stackOfStates.length + 1
              ]);
    
              if (this.stackOfStates > 1) {
                this.stackOfStates[this.stackOfStates.length - 2][2] = this.state;
              }
              this.state = this.config.states[key].transitions[event];
    
              this.undoState = this.state;
              return this.state;
            }
          }
        }
        this.errCount++;
        if (this.errCount > 0) {
          this.stackOfStates.push(
            "error",
            this.state,
            null,
            this.stackOfStates.length + 1
          );
          this.state = "error";
          throw new Error("event in current state isn't exist");
        }
        return this.state;
      }
    
      reset() {
        this.state = this.config.initial;
        this.stackOfStates = [["normal", null, null, 1]]; //pattern [data, prev, next, length]
      }
    
      getStates(event) {
        this.getStatesArr = [];
    
        if (event == null) {
          for (let key in this.config.states) {
            this.getStatesArr.push(key);
          }
        } else {
          for (let key in this.config.states) {
            for (let transitionKey in this.config.states[key].transitions) {
              if (event == transitionKey) {
                this.getStatesArr.push(key);
              }
            }
          }
        }
        return this.getStatesArr;
      }
    
      /**
       * Goes back to previous state.
       * Returns false if undo is not available.
       * @returns {Boolean}
       */
      undo() {
        if (this.stackOfStates.length === 1 || this.undoIndex === this.stackOfStates.length - 1) {
          return false;
        }    
        this.state = this.stackOfStates[
          this.stackOfStates.length - this.undoIndex - 2
        ][0];
        this.undoIndex++;
    
        return true;
      }
      
      redo() {
        if (this.stackOfStates.length === 1 || this.undoIndex == 0) {
          return false;
        }
    
        this.state = this.stackOfStates[
          this.stackOfStates.length - this.undoIndex
        ][0];
        this.undoIndex--;
    
        return true;
      }
      clearHistory() {
        this.stackOfStates = [["normal", null, null, 1]];
      }
    }
    
module.exports = FSM;