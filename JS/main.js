/* *********************************************
*         Fibonacci Calculator (main.js)       * 
* contains all the code used in the assignment *
* **********************************************/

let resultsHistory = null;
let calculatorForm= null;

class LoadingSpinner {  
    constructor(idName) {
        this.elementID = idName;
    }
    turnOn() {
        document.getElementById(this.elementID).classList.remove("invisible");
    }
    turnOff() {
        document.getElementById(this.elementID).classList.add("invisible");
    }
}

class ResultsHistory {
    constructor(properties) {
        this.mainDiv = properties.mainDiv;
        this.url = properties.url;
        this.alertDiv = properties.alertDiv;
        this.loadingSpinner = properties.loadingSpinner;
        this.selectBox = properties.selectBox;
        this.detailsModal = properties.detailsModal;
        this.modalSpan = properties.modalSpan;
	    this.resultLogsFromServer = [];
        this.resultLogElements = [];

        this.selectBox.addEventListener("change", (event) => {
            console.log('select box=', this.selectBox.value);
            this.sort(this.selectBox.value);
            this.clear();
            this.showAll();   
        });
        
        document.getElementById("filter-selected").addEventListener("change", (event) => {
            if (event.target.value === "") {
                document.getElementById("filter-label").classList.add("invisible");
                document.getElementById("filter-input").classList.add("invisible");
                document.getElementById("filter-btn").classList.add("invisible");
            } else {
                document.getElementById("filter-label").classList.remove("invisible");
                document.getElementById("filter-input").classList.remove("invisible");
                document.getElementById("filter-btn").classList.remove("invisible");
            }
        });

        document.getElementById("filter-btn").addEventListener("click", (event) => {
            const filterBy = document.getElementById("filter-selected").value;
            const filterValue = document.getElementById("filter-input").value;
            this.filter(filterBy, filterValue);
        });

        this.refresh();
        this.initDetailsModal();
    }

    async refresh() {
	try {
	    this.mainDiv.classList.add('invisible');  
	    this.turnOffErrorAlert();
        this.loadingSpinner.turnOn();      
	    await this.getData(this.url);
        this.sort(this.selectBox.value);
        this.clear();
        this.showAll();
	} catch(err) {
	    this.turnOnErrorAlert("Error in refresh...");
            console.log(err);
 	} finally {
            this.loadingSpinner.turnOff();
            this.mainDiv.classList.remove('invisible');
        }
    }    

    showAll() {
        this.resultLogsFromServer.forEach((logObjectFromServer, index) => {
            this.resultLogElements[index] = new ResultLogElement(logObjectFromServer);
            // console.log('sorted elements:', this.resultLogElements);
            this.resultLogElements[index].addToPage();
        });
    }

    sort(sortBy) {
        switch(sortBy) {
        case "by-num-asc":
            this.resultLogsFromServer = this.resultLogsFromServer.sort(function (a, b) {
                return a.number - b.number;
            });
            break;
        case "by-num-desc":
            this.resultLogsFromServer = this.resultLogsFromServer.sort(function (a, b) {
                    return b.number - a.number;
                });
            break;
        case "by-date-asc":
            this.resultLogsFromServer = this.resultLogsFromServer.sort(function (a, b) {
                    return a.createdDate - b.createdDate;
                });
            break;
        case "by-date-desc":
            this.resultLogsFromServer = this.resultLogsFromServer.sort(function (a, b) {
                    return b.createdDate - a.createdDate;
                });
            break;
        default:
        }
    }

    async getData(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.resultLogsFromServer = data.results;
        } catch(err) {
	    this.turnOnErrorAlert("Error loading Data from server");            
	    console.log(err);    
        }
    }

    turnOnErrorAlert(errMessage) {
        this.alertDiv.innerHTML = errMessage;
        // console.log('div:', this.alertDiv.getElementsByTagNameNS());
        this.alertDiv.classList.remove("d-none");
    }

    turnOffErrorAlert() {
        this.alertDiv.classList.add("d-none");
    }

    showItem(index) {
        console.log(this.resultLogElements[index]);
    }

    clear() {
        this.mainDiv.innerHTML = "";
    }

    sendDeleteRequest(idToDelete) {
        
        console.log('delete id=', idToDelete,' was sent!!!');
        const urlID = serverURL + "/" + idToDelete;
        console.log(urlID);
    
        fetch(urlID, {
            method: "DELETE",
            headers: {
                'Content-type': 'application/json'
            }
        })
        .then((response) => {
            response.json().then((result) => {
                console.log(result);
                location.reload();
            })
        })
        .catch((error) => {
            console.log(error);
        })
    }

    filter(filterBy, value) {
        const filteredResults = [];
        let filteredIndex = 0;
        this.clear();
        this.resultLogsFromServer.forEach((logObjectFromServer, index) => {
            if (filterBy === "number") {
                if (logObjectFromServer.number == value) {
                    filteredResults[filteredIndex] = new ResultLogElement(logObjectFromServer);
                    filteredResults[filteredIndex].addToPage();
                    filteredIndex++;
                }
            } else if (filterBy === "result") {
                if (logObjectFromServer.result == value) {
                    filteredResults[filteredIndex] = new ResultLogElement(logObjectFromServer);
                    filteredResults[filteredIndex].addToPage();
                    filteredIndex++;
                }
            } else if (filterBy === "date") {
                const date = new Date(logObjectFromServer.createdDate);
                const simpleDate = date.toLocaleDateString();
                console.log('date', simpleDate);
                if (simpleDate == value) {
                    filteredResults[filteredIndex] = new ResultLogElement(logObjectFromServer);
                    filteredResults[filteredIndex].addToPage();
                    filteredIndex++;
                }
            } else {

            }
        });
    }

    initDetailsModal() {
        this.modalSpan.addEventListener("click", () => {
            this.detailsModal.classList.add("d-none");
        });
        
        window.addEventListener("click", (event) => {
            if (event.target == this.detailsModal) {
                this.detailsModal.classList.add("d-none");
            }
        });
    }

    openDetailsModal(number, result, date) {
        this.detailsModal.getElementsByClassName("text-primary")[0].innerHTML = `Result Calculation Details for: ${number}`
        const calcString = calculatorForm.calcFibonacci(number);
        this.detailsModal.getElementsByClassName("modal-body")[0].innerHTML = `Fibonacci(${number}) = ${calcString}`
        this.detailsModal.classList.remove("d-none");
    }

}


class ResultLogElement {
    constructor(logObjectFromServer) {
        this.number = logObjectFromServer.number;
        this.result = logObjectFromServer.result;
        this.createdDate = new Date(logObjectFromServer.createdDate);
        this.id = logObjectFromServer._id;
	    this.mainDiv = null;
    }

    addToPage() {
        const dateAsString = this.createdDate.toString();
        const logLineTemplate = `
        <p class="text-decoration-underline col-auto log-line">
        The Fibonacci of <b>${this.number}</b> is <b>${this.result}</b>. Calculated at: ${dateAsString}
        </p>
        `;
        
        this.mainDiv = document.createElement("div");
        this.mainDiv.id = "log_" + this.id;
        this.mainDiv.innerHTML = logLineTemplate;
        this.mainDiv.addEventListener("click", (event) => {
            resultsHistory.openDetailsModal(this.number, this.result, this.createdDate);
        });
        document.getElementById("history-records").appendChild(this.mainDiv);

    }

    removeFromPage() {
        console.log('remove log line!');
    }

}


function isInputNumValid(numberToCheck) {
    if (numberToCheck < 0 | numberToCheck >50                    
        | !(numberToCheck === parseInt(numberToCheck)) ) {    
        return false;
    } else {
        return true;
    }
}

class CalculatorForm {
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
    
            if (isInputNumValid(input)) {
                input = parseInt(input);
                if (this.saveCheckbox.checked) {
                    this.showFibonacci(input);
                } else {
                    this.calcFibonacci(input);
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

    reset() {
        this.resultLabel.classList.remove("text-danger");
        this.resultLabel.classList.add("result-label");
        this.resultLabel.innerHTML = "";
        this.turnOffAlert();
        resultsHistory.loadingSpinner.turnOff();
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

    async showFibonacci(term) {
        try {
            this.loadingSpinner.turnOn();
            
            const fiboResult = await this.getFiboFromServer(this.url + term);
            if (typeof fiboResult === "number") {
                this.showAsResult(fiboResult);
                resultsHistory.refresh();
            } else if (typeof fiboResult === "string") {
                this.showAsError(fiboResult);
            } else {
                throw new Error("Undefined Output");
            }
        } catch(err) {
            showAsError(err);
        } finally {
            this.loadingSpinner.turnOff();
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

    calcFibonacci (num) {
        let calculationStr = "";
        const fisrtItem = 1;
        const secondItem = 1;
        let previousNum = 0;
        let result = 0;
        let newResult = 0;
    
        for (let index=1; index <= num; index++) {
            if (index === 1) {
                result = fisrtItem;
                previousNum = fisrtItem;
            } else if (index === 2) {
                result = secondItem;
                previousNum = secondItem;
            } else {
                newResult = previousNum + result;
                if (index === num) {
                    calculationStr = `${previousNum}(${index-2}) + ${result}(${index-1}) = ${newResult}`;
                }
                previousNum = result;
                result = newResult;
            }
        }
        if (num === 1) {
            calculationStr = "1";
        } else if (num === 2) {
            calculationStr = "0 + 1 = 1";
        }
        this.showAsResult(result);
        return calculationStr;
    }
}



window.onload = () => {
    init();  
}

async function init() {
	const resultHistoryProperties = {
    		mainDiv: document.getElementById("history-records"),
    		loadingSpinner: new LoadingSpinner("loading-history"),
    		alertDiv: document.getElementById("error-loading"),
    		url: "http://localhost:5050/getFibonacciResults",
    		selectBox: document.getElementById("sort-select"),
            detailsModal: document.getElementById("details-modal"),
            modalSpan: document.getElementsByClassName("close-custom")[0]
	};

	const calculatorFormProperties = {
    		mainDiv: document.getElementById("calc-form"),
    		loadingSpinner: new LoadingSpinner("loading-result"),
    		url: "http://localhost:5050/fibonacci/",
    		inputBox: document.getElementById("input-box"),
    		resultLabel: document.getElementById("result-label"),
    		alertDiv: document.getElementById("alert"),
    		saveCheckbox: document.getElementById("save-calc-checkbox")
	};   

    resultsHistory = new ResultsHistory(resultHistoryProperties);
    calculatorForm = new CalculatorForm(calculatorFormProperties);
}