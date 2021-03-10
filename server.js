// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const apiKeyId = process.env.apiKeyId;
const secretKey = process.env.secretKey;
const Alpaca = require("@alpacahq/alpaca-trade-api");
const alpaca = new Alpaca({
  keyId: apiKeyId,
  secretKey: secretKey,
  paper: true,
  usePolygon: false
});


let statusMSG;
let calendarMSG;

// Get daily price data for ticker over the last 5 trading days and calc % change
const getFiveDayPcCHnage = (ticker) => {
  const barset = alpaca
    .getBars("day", ticker, {
      limit: 5
    })
    .then(barset => {
      console.log(barset);
      const tickerBars = barset[ticker];

      // See how much AAPL moved in that timeframe.
      const week_open = tickerBars[0].openPrice;
      const week_close = tickerBars.slice(-1)[0].closePrice;
      const percent_change = ((week_close - week_open) / week_open) * 100;
      const percent_change_display_formatted = percent_change.toFixed(2);
      return percent_change;
    });
}

const getDailyPrices = (ticker, days) =>
  new Promise((resolve, reject) => {
    const barset = alpaca.getBars("day", ticker, {
      limit: days
    });
    if (barset) {
      resolve(barset);
    } else {
      reject("Error. No barset.");
    }
  });


// // Date and Time zone
const dateFns = require("date-fns");
const format = `yyyy-MM-dd`;
const { formatToTimeZone } = require("date-fns-timezone");
const today = new Date();
const date = dateFns.format(today, format);


// Alpaca API

alpaca.getClock().then(clock => {
  statusMSG = clock.is_open;
});

alpaca
  .getCalendar({
    start: date,
    end: date
  })
  .then(calendars => {
    calendarMSG = calendars;
    console.log(calendars);
  });


// Express

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/status", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json({
    status: statusMSG,
    calendar: calendarMSG
  });
});

app.get("/ticker/:symbol", async (request, response) => {
  let symbol = request.params.symbol;
  getDailyPrices(symbol, 5).then(result =>
    response.json({
      result: result
    })
  ).catch(err => response.json({
      err: err
    }));
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
