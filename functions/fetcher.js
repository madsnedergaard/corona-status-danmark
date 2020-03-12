const faunadb = require("faunadb");

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET
});

exports.handler = function(event, context, callback) {
  console.log("Getting data");
  client
    .query(q.Get(q.Ref(q.Collection("data"), "259772325350605312")))
    .then(response => {
      console.log(response);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(response.data, null, 4),
      });
    })
    .catch(error => {
      console.log("error", error);
      return null;
    });
};
