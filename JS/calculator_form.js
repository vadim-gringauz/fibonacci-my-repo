/* *********************************************
*   Fibonacci Calculator (calculator_form.js)  * 
* contains the class for the Calculator and all*
*               it's operations                *
* **********************************************/

export class CalculatorForm {
    constructor(properties) {
        this.mainDiv = properties.mainDiv;
        this.loadingSpinner = properties.loadingSpinner;
        this.url = properties.url;
        this.inputBox = properties.inputBox;
        this.resultLabel = properties.resultLabel;
        this.alertDiv = properties.alertDiv;
        this.saveCheckbox = properties.saveCheckbox;

        this.inputBox.addEventListener("change", (event) => {
            this.reset();
        });
        
        this.mainDiv.addEventListener('submit', (event) => {
            event.preventDefault();
            let input = this.inputBox.value;
            input = parseFloat(input);  
    
            if (this.isInputNumValid(input)) {
                input = parseInt(input);
                if (this.saveCheckbox.checked) {
                    this.showFibonacci(input);
                } else {
                    this.calcFibonacciLocal(input);
                }
            } else {
                if (input > 50) {
                    this.turnOnAlert("Can't be larger than 50");
                } else {
                    this.showAsError("not valid input");
                }
            }  
        });
    }

    turnOnLoadingSpinner() {
        this.loadingSpinner.classList.remove("invisible");
    }
    turnOffLoadingSpinner() {
        this.loadingSpinner.classList.add("invisible");
    }

    reset() {
        this.resultLabel.classList.remove("text-danger");
        this.resultLabel.classList.add("result-label");
        this.resultLabel.innerHTML = "";
        this.turnOffAlert();
        // resultsHistory.turnOffLoadingSpinner();
    }

    turnOnAlert(errorMessage) {
        this.alertDiv.innerHTML = errorMessage;
        this.inputBox.classList.add("is-invalid");
        this.alertDiv.classList.remove("d-none");
    }

    turnOffAlert() {
        this.alertDiv.innerHTML = "";
        this.inputBox.classList.remove("is-invalid");
        this.alertDiv.classList.add("d-none");
    }

    isInputNumValid(numberToCheck) {
        if (numberToCheck < 0 | numberToCheck >50                    
            | !(numberToCheck === parseInt(numberToCheck)) ) {    
            return false;
        } else {
            return true;
        }
    }

    async showFibonacci(term) {
        try {
            this.turnOnLoadingSpinner();
            
            const fiboResult = await this.getFiboFromServer(this.url + term);
            if (typeof fiboResult === "number") {
                this.showAsResult(fiboResult);

                const refreshResultsHistory = new CustomEvent('refresh');
                document.dispatchEvent(refreshResultsHistory);

            } else if (typeof fiboResult === "string") {
                this.showAsError(fiboResult);
            } else {
                throw new Error("Undefined Output");
            }
        } catch(err) {
            this.showAsError(err);
        } finally {
            this.turnOffLoadingSpinner();
        }
    }

    async getFiboFromServer(url) {
        try {
            const response = await fetch(url);
            
            if (response.status === 400) { 
                const result = await response.text();
                throw new Error("Server Error: " + result);
            } else if (response.status === 200) {                                   
                const result = await response.json();
                return result.result;
            }
        } catch(err) {
            return err.message;
        }
    }

    showAsError(newContent) {
        this.resultLabel.classList.add("text-danger");
        this.resultLabel.classList.remove("result-label");
        this.resultLabel.innerHTML = newContent;
    }
    
    showAsResult(newContent) {
        this.resultLabel.classList.remove("text-danger");
        this.resultLabel.classList.add("result-label");
        this.resultLabel.innerHTML = newContent;
    }

    calcFibonacciLocal (inputNumber) {
        let fisrtItem = 0;
        let secondItem = 1;
        let nextItem = 0;
        if (inputNumber == 1) {
            this.showAsResult("1");
            return 1;
        }

        for (let index=1; index < inputNumber; index++) {
            nextItem = fisrtItem + secondItem;
            fisrtItem = secondItem;
            secondItem = nextItem;
        }
        this.showAsResult(nextItem);
        return nextItem;
    }
}
