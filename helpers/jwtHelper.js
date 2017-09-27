const auth = require('../config/auth');
const Jwt = require('jsonwebtoken');

module.exports = {

    /**
     * sign - Generate a JWT token
     * 
     * @param  {EtuUttUser}
     * @param  {Boolean}
     * @return {string}      The generate JWT
     */
    sign: function(etuUttUser, isAdmin) {

        return Jwt.sign(
            {
                studentId: etuUttUser.studentId,
                login: etuUttUser.login,
                firstName: etuUttUser.firstName,
                lastName: etuUttUser.lastName,
                isAdmin
            },
            auth.secret,
            {
                expiresIn: Math.floor(Date.now() / 1000) + auth.expirationTime
            }
        );
    },

    /**
     * verify - Assyncronously verify JWT validity and return decoded payload
     * with informations about the student
     *
     * @param  {string} jwt The JWT to verify
     * @return {Promise}
     */
    verify: function(jwt) {

        return new Promise((resolve, reject) => {
            return Jwt.verify(jwt, auth.secret, (error, payload) => {
                if (error) {
                    return reject(error);
                }

                return resolve(payload);
            });
        });
    }

};
