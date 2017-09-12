const EtuUTT = require('../lib/EtuUTT.js');

/**
 * EtuUTTService - Will initiate the EtuUTT lib with given user token and configuration
 * @param {Object} user Optionnal User object
 *
 * @return {Object}  EtuUTT lib Object
 */
module.exports = function() {
    return new EtuUTT({
        baseUri: process.env.ETU_UTT_BASEURI,
        id: process.env.ETU_UTT_CLIENT_ID,
        secret: process.env.ETU_UTT_CLIENT_SECRET,
        scopes: process.env.ETU_UTT_SCOPES,
        accessToken: null,
        refreshToken: null,
        tokenExpiration: null,
        tokenRefreshCallback: (accessToken, refreshToken, tokenExpiration) => {
            if(user) {
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                user.tokenExpiration = tokenExpiration;
                user.save((error) => {
                    if (error) {
                        console.error('Error while trying to save new etuutt token to user:', error)
                    }
                });
            }
        },
    });
}
