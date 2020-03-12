const faunadb = require("faunadb");

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler =  function(event, context, callback) {
  console.log("Getting data");
  client
    .query(q.Get(q.Ref(q.Collection("data"), "259772325350605312")))
    .then(response => {
      return response.json();
    })
    .then(json => {
      callback(null, {
        statusCode: 200,
        body: json.data
      });
    })
    .catch(error => {
      console.log("error", error);
      return null;
    });
};
