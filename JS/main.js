/* *********************************************
*         Fibonacci Calculator (main.js)       * 
* contains all the code used in the assignment *
* **********************************************/

const serverURL = "http://localhost:5050/fibonacci/";
const resultsHistoryURL = "http://localhost:5050/getFibonacciResults"

window.onload = () => {
    init();
}

async function init() {
    document.getElementById("input-box").addEventListener("change", resetForm);

    let calcForm = document.getElementById("calc-form");
    calcForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let input = document.getElementById("input-box").value;
        input = parseFloat(input);  

        if (isInputNumValid(input)) {
            input = parseInt(input);
            showFibonacci(input);
        } else {
            if (input > 50) {
                setAlertOn("Can't be larger than 50");
            } else {
                showAsError("not valid input");
            }
        }  
    });

    refreshHistory();
    
}

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
const LoadingSpinnerOnFetchResult = new LoadingSpinner("loading-result");
const LoadingSpinnerOnFetchHistory = new LoadingSpinner("loading-history");

class LoggedCalcRecord {
    constructor(logFromServer) {
        this.number = logFromServer.number;
        this.result = logFromServer.result;
        this.createdDate = new Date(logFromServer.createdDate);
        this.id = logFromServer._id;
        this.addToPage();
    }

    addToPage() {
        console.log(`adding ${this.result} to page`);

        const dateAsString = this.createdDate.toString();
        console.log('date as string:', dateAsString);
        const logLineTemplate = `
        <p class="text-decoration-underline" class="col-auto">
        The Fibonacci of <b>${this.number}</b> is <b>${this.result}</b>. Calculated at: ${dateAsString}
        </p>
        `;
        
        const newDiv = document.createElement("div");
        newDiv.id = "log_" + this.id;
        newDiv.innerHTML = logLineTemplate;
        document.getElementById("history-records").appendChild(newDiv);
    }

    removeFromPage() {
        console.log('remove log line!');
    }
}


function resetForm() {
    document.getElementById("result-label").classList.remove("text-danger");
    document.getElementById("result-label").classList.add("result-label");
    document.getElementById("result-label").innerHTML = "";
    setAlertOff();
    LoadingSpinnerOnFetchResult.turnOff();
    document.getElementById("error-loading").classList.add("d-none");
}

function setAlertOff() {
    document.getElementById("alert").innerHTML = "";
    document.getElementById("input-box").classList.remove("is-invalid");
    document.getElementById("alert").classList.add("invisible");
}

function setAlertOn(alertText) {
    document.getElementById("alert").innerHTML = alertText;
    document.getElementById("input-box").classList.add("is-invalid");
    document.getElementById("alert").classList.remove("invisible");
}


function isInputNumValid(numberToCheck) {
    if (numberToCheck < 0 | numberToCheck >50                    
        | !(numberToCheck === parseInt(numberToCheck)) ) {    
        return false;
    } else {
        return true;
    }
}

async function showFibonacci(term) {
    try {
        LoadingSpinnerOnFetchResult.turnOn();
        
        const fiboResult = await getFiboFromServer(serverURL + term);
        if (typeof fiboResult === "number") {
            showAsResult(fiboResult);
            refreshHistory();
        } else if (typeof fiboResult === "string") {
            showAsError(fiboResult);
        } else {
            throw new Error("Undefined Output");
        }
    } catch(err) {
        showAsError(err);
    } finally {
        LoadingSpinnerOnFetchResult.turnOff();
    }
}

async function getFiboFromServer(url) {
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

function showAsError(newContent) {
    document.getElementById("result-label").classList.add("text-danger");
    document.getElementById("result-label").classList.remove("result-label");
    document.getElementById("result-label").innerHTML = newContent;
}

function showAsResult(newContent) {
    document.getElementById("result-label").classList.remove("text-danger");
    document.getElementById("result-label").classList.add("result-label");
    document.getElementById("result-label").innerHTML = newContent;
}

async function refreshHistory() {
    try {
        document.getElementById('history-records').classList.add('invisible');
        LoadingSpinnerOnFetchHistory.turnOn();
        const allPreviousResults = await getResultsHistory(resultsHistoryURL);
        // console.log('all results:', allPreviousResults);
        // console.log('1st result:', allPreviousResults[0]);
        
        allPreviousResults.forEach((logElement) => {
            console.log(logElement);
            const loggedCalcRecord = new LoggedCalcRecord(logElement);
        });

    } catch(err) {
        document.getElementById("error-loading").classList.remove("d-none");
        console.log(err);
    } finally {
        LoadingSpinnerOnFetchHistory.turnOff();
        document.getElementById('history-records').classList.remove('invisible');
    }
    
}

async function getResultsHistory(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch(err) {
        console.log(err);
        return err;
    }
}


