const faunadb = require("faunadb");

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = async (event, context) => {
  console.log("Getting data");
  return client
    .query(q.Get(q.Ref(q.Collection("data"), "259772325350605312")))
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json.data;
    })
    .catch(error => {
      console.log("error", error);
      return null;
    });
};
