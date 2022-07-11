//Stock Price Visualizer v5
//storage variables
let stockArray = [];
let objStockArray = [];
let dataStorage;
//url vars
let beginURL = `https://sandbox.iexapis.com/stable/stock/market/batch?token=`;
let token = "Tpk_8e92c3647efb43faa8cd1df0e824b2a7";
//element access variables
let $stockList = $("#stocklist");
let $button = $("#button");
let $input = $("#tickerInput");
//loading in the charts
google.charts.load('current', { packages: ['corechart', 'bar'] });

//ensuring the ticker is valid
function verifyLink(verify) {
  //the url assembled
  let verifyURL = `${beginURL}${token}&symbols=${verify}&types=quote`;
  //verifying the link
  //regex for ticker verification
  let stockRegEx = /[A-z]{1,4}|\d{1,3}(?=\.)|\d{4,}/;
  let status;
  $.ajax({ "async": false, "crossDomain": true, "url": verifyURL, "method": "GET", "dataType": "json", "success": function (data, textStatus, xhr) { status = [xhr.status, data]; } });
  return stockRegEx.test(verify) && status[0] === 200 && status[1][verify.toUpperCase()].quote;
}

//button functionality
function addBtn() {
  //getting the user input
  let input = $input.val();
  //ensuring there is input, and verifying it is a valid ticker
  if (input == "") {
    alert("Please enter a stock ticker")
  } else if (verifyLink(input)) {
    $stockList.append(`<li>${input}</li>`);
    stockArray.push(input.toUpperCase());
    objStockArray[stockArray.length - 1] = { stock: stockArray[stockArray.length - 1], price: 0 }
    //refresh the data every five seconds as per instruction
    refreshData();
    setInterval(function () { refreshData(); }, 5000);
  } else {
    alert("Please enter a valid stock ticker");
  }
  $input.val("");
}

//button listeners & redrawing chart with each new stock
$(function () {
  $button.click(function(e){addBtn();});
  //Enter keydown inputs ticker 
  $input.keydown(function (e) { if (e.keyCode == 13) { e.preventDefault(); addBtn(); } });
});

//stitches together the URL to be used in the api
let url = () => {
  //stitches the tickers together
  let tckr = "";
  for (let i in stockArray) { tckr += `${stockArray[i]},` }
  //cleaning up the ticker chain
  tckr = tckr.slice(0, tckr.length - 1);
  //assembling the url
  return `${beginURL}${token}&symbols=${tckr}&types=quote`;
}

//function to refresh data both in the interval and at new quote & to load all chart data into the graph and draw the graph
function refreshData() {
  $.ajax({ 
    "async": false, 
    "crossDomain": true, 
    "url": url(), 
    "method": "GET", 
    "dataType": "json", 
    "success": function (data, textStatus, xhr) { dataStorage = data; },
    "error": function(jqXHR) {console.log(jqXHR)}
  });
  for (let i in objStockArray) { objStockArray[i].price = dataStorage[objStockArray[i].stock].quote.latestPrice };
  let dataArray = [['Stock', 'Price', { role: 'annotation' }]];
  for (let i = 0; i < stockArray.length; i++) { dataArray[i + 1] = [objStockArray[i].stock, objStockArray[i].price, objStockArray[i].price]; }
  let params = [google.visualization.arrayToDataTable(dataArray), { title: 'Stock Prices', chartArea: { width: '75%' }, hAxis: { title: 'Price', minValue: 0 } }];
  let $graphCont = new google.visualization.BarChart(document.getElementById("graphContainer"));
  $graphCont.draw(params[0], params[1]);
}