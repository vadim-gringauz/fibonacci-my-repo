/* *****************************************************
*       Fibonacci Calculator (result_log_element.js)   * 
* contains the class for a "result history log" record *
*                  and it's methods                    *
* ******************************************************/

export class ResultLogElement {
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
            const clickOnResult = new CustomEvent("click-on-result-log", {
                detail: {
                    number: this.number,
                    result: this.result, 
                    date: this.createdDate.toISOString()
                }
            });
            document.dispatchEvent(clickOnResult);
        });
        document.getElementById("history-records").appendChild(this.mainDiv);
    }
}