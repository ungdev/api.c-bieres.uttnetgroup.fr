const routes = require('express').Router();

const https = require('https');

const EtuUTTService = require('../services/EtuUTTService.js');

routes.get("/etuutt/link", (req, res) => {

    const redirectUri = EtuUTTService().oauthAuthorize();

    res.status(200).json({ redirectUri });
});

routes.post("/etuutt/callback", (req, res) => {

    if (!req.body.authorization_code) {
        res.status(400).json({ message: "missing authorization code" })
    }

    let EtuUTT = EtuUTTService();
    let tokenObj;

    EtuUTT.oauthTokenByAuthCode(req.body.authorization_code)
    .then((data) => {
        tokenObj = data;
        return EtuUTT.publicUserAccount();
    })
    .then((etuUTTUser) => {
        // TODO : inscription à l'event

        res.status(200).json({ data: etuUTTUser.data });
    })
    .catch((error) => {
        return res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error});
    })

});

module.exports = routes;
