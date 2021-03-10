// client-side js, loaded by index.html
// run by the browser each time the page is loaded

// define variables that reference elements on our page
const statusLabel = document.querySelector("#statusLabel");
const tickerLabel = document.querySelector("#tickerlabel");
const calDate = document.querySelector("#date");
const calOpen = document.querySelector("#open");
const calClose = document.querySelector("#close");
const calSessionOpen = document.querySelector("#session-open");
const calSessionClose = document.querySelector("#session-close");
const results = document.getElementById("results");
const tickerForm = document.querySelector("form");
const tickerInput = document.querySelector("input");

// a helper function that creates a list item for a given ticker item
function appendNewItem(item) {
  const newListItem = document.createElement("li");
  newListItem.innerText = item;
  results.append(newListItem);
}

// fetch the initial data, market status and calendar
fetch("/status")
  .then(response => response.json()) // parse the JSON from the server
  .then(data => {
    let status = data.status;
    let calendar = data.calendar[0];
    statusLabel.innerText = `${status ? "Yes" : "No"}`;
    calDate.innerText = calendar.date;
    calOpen.innerText = calendar.open;
    calClose.innerText = calendar.close;
    calSessionOpen.innerText = calendar.session_open;
    calSessionClose.innerText = calendar.session_close;
  });

// listen for the form to be submitted and add a new dream when it is
tickerForm.addEventListener("submit", event => {
  // stop our form submission from refreshing the page
  event.preventDefault();
  let ticker = tickerInput.value.toUpperCase();
  fetch("/ticker/" + ticker)
    .then(response => response.json()) // parse the JSON from the server
    .then(data => {
      tickerInput.value = "";
      tickerLabel.innerText = "";
      results.innerHTML = "";
      let result = data.result;
      let ticker = Object.keys(result)[0];
      tickerLabel.innerText = ticker;
      let daysArray = result[ticker];

      for (let day of daysArray) {
        let dateObj = new Date(day.startEpochTime * 1000);
        let year = dateObj.getFullYear();
        let month = dateObj.getMonth() + 1;
        let dayOfMonth = dateObj.getDate();
        let dateString = dateObj.toDateString()
        let item = `${dateString}, ${day.closePrice.toFixed(2)}`;
        appendNewItem(item);
      }
    });
});
