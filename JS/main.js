/* *********************************************
*         Fibonacci Calculator (main.js)       * 
* contains all the code used in the assignment *
* **********************************************/

import ResultsHistory from "./results_history.js";
import {CalculatorForm} from "./calculator_form.js"

class App {
    constructor() {
        this.resultsHistory = null;
        this.calculatorForm = null;
        this.init();
    }

    init() {
        const resultHistoryProperties = {
                mainDiv: document.getElementById("history-records"),
                loadingSpinner: document.getElementById("loading-history"),
                alertDiv: document.getElementById("error-loading"),
                url: "http://localhost:5050/getFibonacciResults",
                selectBox: document.getElementById("sort-select"),
                detailsModal: document.getElementById("details-modal"),
                modalSpan: document.getElementsByClassName("close-custom")[0]
        };
    
        const calculatorFormProperties = {
                mainDiv: document.getElementById("calc-form"),
                loadingSpinner: document.getElementById("loading-result"),
                url: "http://localhost:5050/fibonacci/",
                inputBox: document.getElementById("input-box"),
                resultLabel: document.getElementById("result-label"),
                alertDiv: document.getElementById("alert"),
                saveCheckbox: document.getElementById("save-calc-checkbox")
        };   
    
        this.resultsHistory = new ResultsHistory(resultHistoryProperties);
        this.calculatorForm = new CalculatorForm(calculatorFormProperties);

        const versionSwitch = document.getElementById('version-switch');
        const activeVersion = document.getElementById('active-version');
        versionSwitch.addEventListener("change", (event) => {
            if (versionSwitch.checked) {
                activeVersion.innerHTML = "Active Version: Milestone 7.2 v1.0";
                this.showExtraFeatures();
            } else {
                activeVersion.innerHTML = "Active Version: Milestone 7.1 v1.1";
                this.hideExtraFeatures();
            }
        });
    
    }

    hideExtraFeatures() {
        const turnOffExtra = new CustomEvent('hideExtra');
        document.dispatchEvent(turnOffExtra);
    }

    showExtraFeatures() {
        const turnOnExtra = new CustomEvent('showExtra');
        document.dispatchEvent(turnOnExtra);
    }
}

window.onload = () => {
    const app = new App();
}

