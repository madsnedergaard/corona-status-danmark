require("isomorphic-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const currentData = require("data.json");

const ENDPOINT = "https://stps.dk/";

exports.handler = async (event, context) => {
  const res = await fetch(ENDPOINT);
  const response = await res.text();

  let $ = cheerio.load(response);
  const text = $(".link-box-link.color-creme.align-center").text();
  const amount = text
    .split("personer:")[1]
    .trim()
    .split("\n")[0];
  const fullDate = text.split("Opdateret")[1].trim();
  const date = text.split("Opdateret")[1].split('2020')[0].trim();

  const newEntry = {
    amount: parseInt(amount, 10),
    date: date
  };

  const index = currentData.data.findIndex(e => e.date === date);
  if (index === -1) {
    currentData.data.push(newEntry);
  } else {
    currentData.data[index] = newEntry;
  }
  const newData = {
    lastUpdate: fullDate,
    lastCheck: `${new Date()}`,
    data: currentData.data,
  };

  const json = JSON.stringify(newData, null, 4);
  fs.writeFileSync("../data.json", json);
};