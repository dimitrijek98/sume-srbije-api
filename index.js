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

app.get('/', (req, res) => {
    res.status(200).send("OK");
});

app.post('/login', (req, res) => {
    console.log(req.body);
    let email = req.body.email;
    let password = req.body.password;
    let query = 'SELECT * FROM \"Admin\" WHERE email = ?';
    const params = [email];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Admin not found.");
                return;
            }
            if (response.rows[0].password === password) {
                res.status(200).send(JSON.stringify(response.rows[0]));
            }
            else {
                res.status(422).send("Problem with email or password.");
            }
        })
        .catch(err => console.log(err));
});

//niz drveca za dropbox pri dodavanju mesecne statistike
app.get('/AllTrees', (req, res) => {
    let query = 'SELECT \"drvoID\", naziv FROM \"Drvo\"';
    client.execute(query)
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Trees not found.");
                return;
            }
            let niz = [];
            response.rows.forEach(e => {
                let pom = { id: e.drvoID, ime: e.naziv };
                niz.push(pom);
            });
            res.status(200).send(JSON.stringify(niz));
        })
        .catch(err => console.log(err));
});

//niz regiona za dropbox pri dodavanju mesecne statistike
app.get('/AllRegions', (req, res) => {
    let query = 'SELECT \"regID\", ime FROM \"Region\"';
    client.execute(query)
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Regions not found.");
                return;
            }
            let niz = [];
            response.rows.forEach(e => {
                let pom = { id: e.regID, ime: e.ime };
                niz.push(pom);
            });
            res.status(200).send(JSON.stringify(niz));
        })
        .catch(err => console.log(err));
});

//brisanje drveta iz baze
app.post('/deleteTree', (req, res) => {
    let drvo = req.body.drvo;
    let query = 'DELETE FROM \"Drvo\" WHERE \"drvoID\" = ?';
    const params = [drvo];
    client.execute(query, params, { prepare: true })
        .then(response => {
            res.status(200).send("Tree has been deleted.");
        })
        .catch(err => console.log(err));
});

//unos nove statistike
app.post('/newStatistics', (req, res) => {
    /* let query = 'SELECT next_id FROM "IDs" WHERE id_name = ?';
     let suma;
     client.execute(query, ['suma'])
         .then(response => {
             if (response.rows.length < 1) {
                 res.status(404).send("ID not found.");
                 return;
             }
             suma = response.rows[0].next_id;
         })
         .catch(err => console.log(err));
     let id = suma + 1;
     query = 'UPDATE "IDs" SET next_id = ? WHERE id_name= ?';
     client.execute(query, [id, 'suma'])
         .then(response => {
             if (response.rows.length < 1) {
                 res.status(404).send("ID not found.");
                 return;
             }
         })
         .catch(err => console.log(err));*/
    var d = new Date();
    var month = new Array();
    month[0] = "Januar";
    month[1] = "Februar";
    month[2] = "Mart";
    month[3] = "April";
    month[4] = "Maj";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Avgust";
    month[8] = "Septembar";
    month[9] = "Oktobar";
    month[10] = "Novembar";
    month[11] = "Decembar";
    let mesec = month[d.getMonth()];
    let godina = d.getFullYear();
    let region = req.body.region;
    let drvo = req.body.drvo;
    let brPosecena = req.body.brPosecena;
    let brZasadjena = req.body.brZasadjena;
    let povrsPosecena = req.body.povrsPosecena;
    let povrsZasadjena = req.body.povrsZasadjena;
    let query = 'INSERT INTO \"Suma\" (godina, mesec, \"regID\", \"drvoID\", posecenabr, posecenapovrs, zasadjenabr, zasadjenapovrs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [godina, mesec, region, drvo, brPosecena, povrsPosecena, brZasadjena, povrsZasadjena];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Forest not found.");
                return;
            }
            res.status(200).send("Forest has been added.");
        })
        .catch(err => console.log(err));
});

//unos novog drveta i njegove statistike
app.post('/newTreeAndStatistics', (req, res) => {
    let query = 'SELECT next_id FROM "IDs" WHERE id_name = ?';
    let drvo;
    client.execute(query, ['drvo'])
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("ID not found.");
                return;
            }
            drvo = response.rows[0].next_id;
        })
        .catch(err => console.log(err));
    let id = drvo + 1;
    query = 'UPDATE "IDs" SET next_id = ? WHERE id_name= ?';
    client.execute(query, [id, 'drvo'])
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("ID not found.");
                return;
            }
        })
        .catch(err => console.log(err));
    let tip = req.body.tip;
    let naziv = req.body.naziv;
    query = 'INSERT INTO \"Drvo\" (\"drvoID\", \"tipID\", naziv) VALUES (?, ?, ?)';
    let params = [drvo, tip, naziv];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Tree not added.");
                return;
            }
            //.status(200).send("Tree has been added.");
        })
        .catch(err => console.log(err));

    /*query = 'SELECT next_id FROM "IDs" WHERE id_name = ?';
    let suma;
    client.execute(query, ['suma'])
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("ID not found.");
                return;
            }
            suma = response.rows[0].next_id;
        })
        .catch(err => console.log(err));
    id = suma + 1;
    query = 'UPDATE "IDs" SET next_id = ? WHERE id_name= ?';
    client.execute(query, [id, 'suma'])
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("ID not found.");
                return;
            }
        })
        .catch(err => console.log(err));*/
    var d = new Date();
    var month = new Array();
    month[0] = "Januar";
    month[1] = "Februar";
    month[2] = "Mart";
    month[3] = "April";
    month[4] = "Maj";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Avgust";
    month[8] = "Septembar";
    month[9] = "Oktobar";
    month[10] = "Novembar";
    month[11] = "Decembar";
    let mesec = month[d.getMonth()];
    let godina = d.getFullYear();
    let region = req.body.region;
    let brPosecena = req.body.brPosecena;
    let brZasadjena = req.body.brZasadjena;
    let povrsPosecena = req.body.povrsPosecena;
    let povrsZasadjena = req.body.povrsZasadjena;
    query = 'INSERT INTO \"Suma\" (godina, mesec, \"regID\", \"drvoID\", posecenabr, posecenapovrs, zasadjenabr, zasadjenapovrs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    params = [godina, mesec, region, drvo, brPosecena, povrsPosecena, brZasadjena, povrsZasadjena];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Forest not found.");
                return;
            }
            res.status(200).send("Forest has been added.");
        })
        .catch(err => console.log(err));
});

//klijentsi deo
//prvi grafik, vraca se broj zasadjenih u svakom mesecu na celoj teritoriji
app.get('/AllPlantings', (req, res) => {
    let query = 'SELECT mesec, zasadjenabr FROM \"Suma\" WHERE godina = ?';
    let d = new Date();
    const params = [d.getFullYear() - 1];//idi na sve -1 da bi sve isao za proslu godinu
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Plantings not found.");
                return;
            }
            let jan = 0;
            let feb = 0;
            let mar = 0;
            let apr = 0;
            let maj = 0;
            let jun = 0;
            let jul = 0;
            let avg = 0;
            let sep = 0;
            let okt = 0;
            let nov = 0;
            let dec = 0;
            response.rows.forEach(e => {
                if (e.mesec === "Januar")
                    jan += e.zasadjenabr;
                else if (e.mesec === "Februar")
                    feb += e.zasadjenabr;
                else if (e.mesec === "Mart")
                    mar += e.zasadjenabr;
                else if (e.mesec === "April")
                    apr += e.zasadjenabr;
                else if (e.mesec === "Maj")
                    maj += e.zasadjenabr;
                else if (e.mesec === "Jun")
                    jun += e.zasadjenabr;
                else if (e.mesec === "Jul")
                    jul += e.zasadjenabr;
                else if (e.mesec === "Avgust")
                    avg += e.zasadjenabr;
                else if (e.mesec === "Septembar")
                    sep += e.zasadjenabr;
                else if (e.mesec === "Oktobar")
                    okt += e.zasadjenabr;
                else if (e.mesec === "Novembar")
                    nov += e.zasadjenabr;
                else if (e.mesec === "Decembar")
                    dec += e.zasadjenabr;
            });
            let niz = [];
            let pom = { mesec: "Jan", broj: jan };
            niz.push(pom);
            pom = { mesec: "Feb", broj: feb };
            niz.push(pom);
            pom = { mesec: "Mar", broj: mar };
            niz.push(pom);
            pom = { mesec: "Apr", broj: apr };
            niz.push(pom);
            pom = { mesec: "Maj", broj: maj };
            niz.push(pom);
            pom = { mesec: "Jun", broj: jun };
            niz.push(pom);
            pom = { mesec: "Jul", broj: jul };
            niz.push(pom);
            pom = { mesec: "Avg", broj: avg };
            niz.push(pom);
            pom = { mesec: "Sep", broj: sep };
            niz.push(pom);
            pom = { mesec: "Okt", broj: okt };
            niz.push(pom);
            pom = { mesec: "Nov", broj: nov };
            niz.push(pom);
            pom = { mesec: "Dec", broj: dec };
            niz.push(pom);
            res.status(200).send(JSON.stringify(niz));
        })
        .catch(err => console.log(err));
});

//drugi grafik, na osnovu prosledjenog meseca vraca broj posecenih u svakoj regiji
app.get('/monthCuts', (req, res) => {
    let mesec = req.body.mesec;
    let query = 'SELECT \"regID\", posecenabr FROM \"Suma\" WHERE godina = ? AND mesec = ?';
    let d = new Date();
    const params = [d.getFullYear() - 1, mesec];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Cuts not found.");
                return;
            }
            let vojvodina = 0;
            let zapadna = 0;
            let centralna = 0;
            let istocna = 0;
            let juzna = 0;
            let kim = 0;
            response.rows.forEach(e => {
                if (e.regID === "1")
                    vojvodina += e.posecenabr;
                else if (e.regID === "2")
                    zapadna += e.posecenabr;
                else if (e.regID === "3")
                    centralna += e.posecenabr;
                else if (e.regID === "4")
                    istocna += e.posecenabr;
                else if (e.regID === "5")
                    juzna += e.posecenabr;
                else if (e.regID === "6")
                    kim += e.posecenabr;

            });
            let niz = [];
            let pom = { region: "1", broj: vojvodina };
            niz.push(pom);
            pom = { region: "2", broj: zapadna };
            niz.pushregion;
            pom = { region: "3", broj: centralna };
            niz.pushregion;
            pom = { region: "4", broj: istocna };
            niz.pushregion;
            pom = { region: "5", broj: juzna };
            niz.pushregion;
            pom = { region: "6", broj: kim };
            niz.push(pom);
            res.status(200).send(JSON.stringify(niz));
        })
        .catch(err => console.log(err));
});

//treci grafik prvi deo, na osnovu prosledjenog regiona vraca broj zasadjenih i posecenih za celu godinu

app.get('/regionPlantingsAndCuts', (req, res) => {
    let region = req.body.region;
    let query = 'SELECT posecenabr, zasadjenabr FROM \"Suma\" WHERE godina = ? AND \"regID\" = ?';
    let d = new Date();
    const params = [d.getFullYear() - 1, region];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Plantings and cuts not found.");
                return;
            }
            let janZasadjena = 0;
            let febZasadjena = 0;
            let marZasadjena = 0;
            let aprZasadjena = 0;
            let majZasadjena = 0;
            let junZasadjena = 0;
            let julZasadjena = 0;
            let avgZasadjena = 0;
            let sepZasadjena = 0;
            let oktZasadjena = 0;
            let novZasadjena = 0;
            let decZasadjena = 0;
            let janPosecena = 0;
            let febPosecena = 0;
            let marPosecena = 0;
            let aprPosecena = 0;
            let majPosecena = 0;
            let junPosecena = 0;
            let julPosecena = 0;
            let avgPosecena = 0;
            let sepPosecena = 0;
            let oktPosecena = 0;
            let novPosecena = 0;
            let decPosecena = 0;
            response.rows.forEach(e => {
                if (e.mesec === "Januar") {
                    janZasadjena += e.zasadjenabr;
                    janPosecena += e.posecenabr;
                }
                else if (e.mesec === "Februar") {
                    febZasadjena += e.zasadjenabr;
                    febPosecena += e.posecenabr;
                }
                else if (e.mesec === "Mart") {
                    marZasadjena += e.zasadjenabr;
                    marPosecena += e.posecenabr;
                }
                else if (e.mesec === "April") {
                    aprZasadjena += e.zasadjenabr;
                    aprPosecena += e.posecenabr;
                }
                else if (e.mesec === "Maj") {
                    majZasadjena += e.zasadjenabr;
                    majPosecena += e.posecenabr;
                }
                else if (e.mesec === "Jun") {
                    junZasadjena += e.zasadjenabr;
                    junPosecena += e.posecenabr;
                }
                else if (e.mesec === "Jul") {
                    julZasadjena += e.zasadjenabr;
                    julPosecena += e.posecenabr;
                }
                else if (e.mesec === "Avgust") {
                    avgZasadjena += e.zasadjenabr;
                    avgPosecena += e.posecenabr;
                }
                else if (e.mesec === "Septembar") {
                    sepZasadjena += e.zasadjenabr;
                    sepPosecena += e.posecenabr;
                }
                else if (e.mesec === "Oktobar") {
                    oktZasadjena += e.zasadjenabr;
                    oktPosecena += e.posecenabr;
                }
                else if (e.mesec === "Novembar") {
                    novZasadjena += e.zasadjenabr;
                    novPosecena += e.posecenabr;
                }
                else if (e.mesec === "Decembar") {
                    decZasadjena += e.zasadjenabr;
                    decPosecena += e.posecenabr;
                }
            });
            let nizZasadjena = [];
            let nizPosecena = [];
            let pom = { mesec: "Jan", broj: janZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Jan", broj: janPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Feb", broj: febZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Feb", broj: febPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Mar", broj: marZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Mar", broj: marPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Apr", broj: aprZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Apr", broj: aprPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Maj", broj: majZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Maj", broj: majPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Jun", broj: junZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Jun", broj: junPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Jul", broj: julZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Jul", broj: julPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Avg", broj: avgZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Avg", broj: avgPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Sep", broj: sepZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Sep", broj: sepPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Okt", broj: oktZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Okt", broj: oktPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Nov", broj: novZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Nov", broj: novPosecena };
            nizPosecena.push(pom);
            pom = { mesec: "Dec", broj: decZasadjena };
            nizZasadjena.push(pom);
            pom = { mesec: "Dec", broj: decPosecena };
            nizPosecena.push(pom);
            let returnArr = { posecena: nizPosecena, zasadjena: nizZasadjena };
            res.status(200).send(JSON.stringify(returnArr));
        })
        .catch(err => console.log(err));
});

//treci grafik drugi deo,na osnovu prosledjenog regiona vraca broj zasadjenih i posecenih drveca za konkretno drvo za celu proslu godinu

app.get('/regionTreesPlantingsAndCuts', (req, res) => {
    let niz = [];
    let query = 'SELECT \"drvoID\", naziv FROM \"Drvo\"';
    client.execute(query)
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("Trees not found.");
                return;
            }
            response.rows.forEach(e => {
                let pom = { id: e.drvoID, ime: e.naziv, zasadjeno: 0, poseceno: 0 };
                niz.push(pom);
            });
            let region = req.body.region;
            query = 'SELECT \"drvoID\", posecenabr, zasadjenabr FROM \"Suma\" WHERE godina = ? AND \"regID\" = ?';
            let d = new Date();
            const params = [d.getFullYear() - 1, region];
            client.execute(query, params, { prepare: true })
                .then(response => {
                    if (response.rows.length < 1) {
                        res.status(404).send("All trees plantings and cuts not found.");
                        return;
                    }
                    niz.forEach(drvo => {
                        response.rows.forEach(e => {
                            if (drvo.id === e.drvoID) {
                                drvo.zasadjeno += e.zasadjenabr;
                                drvo.poseceno += e.posecenabr;
                            }
                        });
                    });
                    res.status(200).send(JSON.stringify(niz));
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

//treci grafik drugi deo,na osnovu prosledjenog regiona vraca povrsinu zasadjenih i posecenih drveca za celu proslu godinu
app.get('/regionSpaceTreesPlantingsAndCuts', (req, res) => {
    let region = req.body.region;
    let query = 'SELECT posecenapovrs, zasadjenapovrs FROM \"Suma\" WHERE godina = ? AND \"regID\" = ?';
    let d = new Date();
    const params = [d.getFullYear() - 1, region];
    client.execute(query, params, { prepare: true })
        .then(response => {
            if (response.rows.length < 1) {
                res.status(404).send("All trees space plantings and cuts not found.");
                return;
            }
            let result = { zasadjeno: 0, poseceno: 0 };
            response.rows.forEach(e => {
                result.zasadjeno += e.zasadjenapovrs;
                result.poseceno += e.posecenapovrs;
            });
            res.status(200).send(JSON.stringify(result));
        })
        .catch(err => console.log(err));
});