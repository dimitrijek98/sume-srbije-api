const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
const bodyParser = require("body-parser");

const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'database' });


app.use(cors());
app.listen(port);
app.use(bodyParser.json());

app.get('/', (req, res) =>{
    res.status(200).send("OK");
});

app.post('/login',(req, res) => {
    console.log(req.body);
    let email = req.body.email;
    let password =  req.body.password;
    const query = 'SELECT * FROM \"Admin\" WHERE email = ?';
    const params = [email];
    client.execute(query,params, {prepare:true})
        .then(response => {
            if(response.rows.length < 1 ){
                res.status(404).send("Admin not found.");
                return;
            }
            if(response.rows[0].password === password){
                res.status(200).send(JSON.stringify(response.rows[0]));
            }
            else{
                res.status(422).send("Problem with email or password.");
            }
        })
        .catch(err => console.log(err));
});
/*
const query = 'SELECT name, email FROM users WHERE key = ?';
client.execute(query, [ 'someone' ])
  .then(result => console.log('User with email %s', result.rows[0].email));
*/
//client.execute(query, params, { prepare: true }).then(result => console.log('Row updated on the cluster'));