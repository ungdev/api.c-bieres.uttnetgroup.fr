const routes = require('express').Router();
<<<<<<< HEAD
const https = require('https');

const EtuUTTService = require('../services/EtuUTTService.js');

routes.get("/etuutt/link", (req, res) => {

    const redirectUri = EtuUTTService().oauthAuthorize();

    res.status(200).json({ redirectUri });
});

module.exports = routes;
