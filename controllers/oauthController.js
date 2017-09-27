const EtuUTTService = require('../services/EtuUTTService.js');
const jwtHelper = require('../helpers/jwtHelper');

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
        res.status(200).json(jwtHelper.sign(etuUTTUser.data, true));
    })
    .catch((error) => {
        return res.status(500).json({ message: "An error occurs during communications with the api of EtuUTT: " + error});
    })

};
