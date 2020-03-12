"use strict";

const chartColors = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)"
};

var config = {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Antal smittede",
        backgroundColor: chartColors.red,
        borderColor: chartColors.red,
        data: [],
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      mode: "index",
      intersect: false
    },
    legend: {
      display: true,
      position: "bottom",
      labels: {
        fontColor: "rgb(255, 99, 132)"
      }
    },
    hover: {
      mode: "nearest",
      intersect: true
    }
  }
};

fetch('./data.json')
.then(response => {
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }
    return response.json();
})

function buildChart(response) {
    var labels = response.data.map(d => d.date);
    var values = response.data.map(d => d.amount);
    config.data.labels = labels;
    config.data.datasets[0].data = values;
    document.getElementById("lastupdate").innerText = response.lastUpdate;
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myLine = new Chart(ctx, config);
}


window.onload = function() {
  var url = `/.netlify/functions/fetcher`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      console.log(response);
      return response.json();
    })
    .then(json => {
      console.log(json);
      buildChart(json);
    })
    .catch(function(error) {
      console.log(error);
      fetch('./data.json')
      .then(response => {
          if (!response.ok) {
              alert('Der er opstået en fejl.');
          }
          return response.json();
      })
      .then(json => {
        buildChart(json);
      })
  
      return null;
    });
};
