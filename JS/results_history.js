/* *****************************************************
*       Fibonacci Calculator (ResultsHistory.js)       * 
* contains the class that operates all Results History *
* ******************************************************/
import {ResultLogElement} from "./result_log_element.js"

export default class ResultsHistory {
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
        this.init();
    }

    init() {
        this.selectBox.addEventListener("change", (event) => {
            this.sort(this.selectBox.value);
            this.clear();
            this.showAll();   
        });
        
        document.getElementById("filter-selected").addEventListener("change", (event) => {
            if (event.target.value === "") { // Unfilter!
                document.getElementById("filter-label").classList.add("invisible");
                document.getElementById("filter-input").classList.add("invisible");
                document.getElementById("filter-btn").classList.add("invisible");
                this.showAll();
            } else {
                document.getElementById("filter-label").classList.remove("invisible");
                document.getElementById("filter-input").classList.remove("invisible");
                if (event.target.value === "number") {
                    document.getElementById("filter-input").setAttribute("placeholder", "#1-50")
                } else if (event.target.value === "result") {
                    document.getElementById("filter-input").setAttribute("placeholder", "#")
                } else if (event.target.value === "date") {
                    document.getElementById("filter-input").setAttribute("placeholder", "MM/DD/YYYY")
                }
                document.getElementById("filter-btn").classList.remove("invisible");
            }
        });

        document.getElementById("filter-btn").addEventListener("click", (event) => {
            const filterBy = document.getElementById("filter-selected").value;
            const filterValue = document.getElementById("filter-input").value;
            this.filter(filterBy, filterValue);
        });

        document.addEventListener('refresh', (event) => {
            this.refresh();
        });
        document.addEventListener('click-on-result-log', (event) => {
            this.openDetailsModal(event.detail.number, event.detail.result, event.detail.date);
        });
        
        document.addEventListener('hideExtra', (event) => {
            this.toggleExtraFeatures();
        });
        document.addEventListener('showExtra', (event) => {
            this.toggleExtraFeatures();
        });

        this.refresh();
        this.initDetailsModal();
    }

    turnOnLoadingSpinner() {
        this.loadingSpinner.classList.remove("invisible");
    }
    turnOffLoadingSpinner() {
        this.loadingSpinner.classList.add("invisible");
    }

    async refresh() {
	try {
	    this.mainDiv.classList.add('invisible');  
	    this.turnOffErrorAlert();
        this.turnOnLoadingSpinner();      
	    await this.getData(this.url);
        this.sort(this.selectBox.value);
        this.clear();
        this.showAll();
	} catch(err) {
	    this.turnOnErrorAlert("Error in refresh...");
            console.log(err);
 	} finally {
            this.turnOffLoadingSpinner();
            this.mainDiv.classList.remove('invisible');
        }
    }    

    showAll() {
        this.resultLogsFromServer.forEach((logObjectFromServer, index) => {
            this.resultLogElements[index] = new ResultLogElement(logObjectFromServer);
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
        this.alertDiv.classList.remove("d-none");
    }

    turnOffErrorAlert() {
        this.alertDiv.classList.add("d-none");
    }

    clear() {
        this.mainDiv.innerHTML = "";
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

    calcFibonacciLocal (inputNumber) {
        let fisrtItem = 0;
        let secondItem = 1;
        let nextItem = 0;
        if (inputNumber == 1) {
            return 1;
        }

        for (let index=1; index < inputNumber; index++) {
            nextItem = fisrtItem + secondItem;
            fisrtItem = secondItem;
            secondItem = nextItem;
        }
        return nextItem;
    }

    openDetailsModal(number, result, date) {
        this.detailsModal.getElementsByClassName("text-primary")[0].innerHTML = `Result Calculation Details for: ${number}`
        
        if (number === 0) {
            this.detailsModal.getElementsByClassName("modal-body")[0].innerHTML = "Fibonacci(0) = 0";
        } else if (number === 1) {
            this.detailsModal.getElementsByClassName("modal-body")[0].innerHTML = "Fibonacci(1) = 1";
        } else {
            const firstItem = this.calcFibonacciLocal(number-2);
            const secondItem = this.calcFibonacciLocal(number-1);
            this.detailsModal.getElementsByClassName("modal-body")[0].innerHTML = `
                Fibonacci(${number}) = &#402;(${number-2}) + &#402;(${number-1}) =<br>
                ${firstItem} + ${secondItem} = ${result}
                `;
        }
        this.detailsModal.getElementsByClassName("modal-footer-text")[0].innerHTML =
            `This result was saved on: ${date}`;
        this.detailsModal.classList.remove("d-none");
    }

    toggleExtraFeatures() {
        document.getElementById('filter-container').classList.toggle('invisible');
    }
}