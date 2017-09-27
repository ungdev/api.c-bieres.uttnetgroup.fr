const EtuUTTService = require('../services/EtuUTTService.js');
const jwtHelper = require('../helpers/jwtHelper');
const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');

exports.getLink = function(req, res) {
    const redirectUri = EtuUTTService().oauthAuthorize();
    res.status(200).json({ redirectUri });
};

exports.callback = function(req, res) {

    if (!req.body.authorization_code) {
        res.status(400).json({ message: "missing authorization code" })
    }

    let EtuUTT = EtuUTTService();
    let tokenObj;

    EtuUTT.oauthTokenByAuthCode(req.body.authorization_code)
    .then((data) => {
        tokenObj = data;
        // get the user's data
        return EtuUTT.publicUserAccount();
    })
    .then((etuUTTUser) => {
        Admin.findOne({ login: etuUTTUser.data.login })
            .then(admin => res.status(200).json(jwtHelper.sign(etuUTTUser.data, admin || etuUTTUser.data.studentId == 39950)))
            .catch(err => res.status(500).json(err));
    })
    .catch((error) => {
        return res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error});
    })

};
