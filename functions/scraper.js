require("isomorphic-fetch");
const path = require('path');
const cheerio = require("cheerio");
const fs = require('fs');
const faunadb = require('faunadb');

const ENDPOINT = "https://www.sst.dk/da/Viden/Smitsomme-sygdomme/Smitsomme-sygdomme-A-AA/Coronavirus/Spoergsmaal-og-svar";
const HOSPITALISED_ENDPOINT = "https://www.sst.dk/corona";

/* configure faunaDB Client with our secret */
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
})

async function getData() {
  console.log('Getting data')
  return client.query(
    q.Get(q.Ref(q.Collection('data'), '259772325350605312'))
  )
  .then((response) => {
    return response.data;
  }).catch((error) => {
    console.log("error", error)
  })
}

async function saveData(data) {
  return client.query(
    q.Update(q.Ref(q.Collection('data'), '259772325350605312'), {data: data})
  )
  .then((response) => {
    console.log(response);
  }).catch((error) => {
    console.log("error", error)
  })
}

const getHospitalised = async () => {
  const res = await fetch(HOSPITALISED_ENDPOINT);
  const response = await res.text();
  let $ = cheerio.load(response);
  let colIndex = null;
  let rowIndex = null;

  // Find the correct column
  const table = $('h2:contains("Antal patienter indlagt med bekræftet COVID-19")').next('table');
  $('tbody tr:first-of-type td', table).each((i, elem) => {
      if ($(elem).text().trim() === 'Antal indlagte i alt') {
        colIndex = i;
      }
  });

  // Find the correct row
  $('tbody tr td:first-of-type', table).each((i, elem) => {
    if ($(elem).text().trim() === 'Hele landet') {
      rowIndex = i;
    }
  });

  const amount = $("tbody tr", table).eq(rowIndex).find('td').eq(colIndex).text();
  
  // find date - currently it appears below the table
  const rawDate = $(table).next('p:contains("Opdateret")').text();
  const fullDate = rawDate.split("Opdateret")[1].trim();
  const date = rawDate.split("Opdateret")[1].split('kl')[0].trim();

  return {
    amount: parseInt(amount, 10),
    fullDate: fullDate,
    date: date
  }
}

const getInfected = async () => {
  const res = await fetch(ENDPOINT);
  const response = await res.text();

  let $ = cheerio.load(response);
  let rowIndex = null;
  // Find the correct column
  $('table tbody tr:first-of-type td').each((i, elem) => {
      if ($(elem).text().trim() === 'Smittede personer') {
        rowIndex = i;
      }
  });

  const amount = $("table tbody tr:first-of-type").next().find('td').eq(rowIndex).text();

  // find date - currently it appears below the table
  const rawDate = $('table').parent().nextAll('p:contains("Opdateret")').text();
  const fullDate = rawDate.split("Opdateret")[1].trim();
  const date = rawDate.split("Opdateret")[1].split(',')[0].trim();
  
  return {
    amount: parseInt(amount, 10),
    fullDate: fullDate,
    date: date
  };
}


const handler = async (event, context, callback) => {

  const hospitalised = await getHospitalised();
  const infected = await getInfected();

  const newEntry = {
    hospitalised: parseInt(hospitalised.amount, 10),
    amount: infected.amount,
    date: infected.date
  };

  const currentData = await getData();
  const index = currentData.data.findIndex(e => e.date === date);
  if (index === -1) {
    currentData.data.push(newEntry);
  } else {
    currentData.data[index] = newEntry;
  }
  const newData = {
    lastUpdate: hospitalised.fullDate,
    lastCheck: `${new Date()}`,
    data: currentData.data,
  };

  console.log(newData);
  const saved = await saveData(newData)
  
  callback(null, {
    statusCode: 200,
    body: "ok"
    });
};

handler();

module.exports = handler;