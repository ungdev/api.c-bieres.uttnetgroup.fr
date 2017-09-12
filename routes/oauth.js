const routes = require('express').Router();
var https = require('https');

routes.get("/etuutt/link", (req, res) => {/*
    https.get(`https://etu.utt.fr/api/oauth/authorize?client_id=${process.env.CLIENT_ID}&scopes=private_user_account&response_type=code&state=xyz`, (res) => {
        console.log(res);
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });*/

    https.get(`https://etu.utt.fr/api/oauth/authorize?client_id=${process.env.CLIENT_ID}&scopes=private_user_account&response_type=code&state=xyz`, (res) => {

        res.on('data', (data) => {
            console.log(data);
            process.stdout.write(data);
        });

    }).on('error', (e) => {
        console.error(e);
    });

    res.status(200).json({ link: 'Connected!' });
});

module.exports = routes;
