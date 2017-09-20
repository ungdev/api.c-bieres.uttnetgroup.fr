const fs = require('fs.extra');

/**
 * Take the uploaded beer image and move it
 * into the public directory
 *
 * @param {file}
 * @return {Promise}
 */
exports.saveUploadedBeerImage = function(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve();

        fs.copy(file.path, "public/beers/" + file.originalname, { replace: true },  err => {
            if (err) reject(err);
            resolve("beers/" + file.originalname);
        });

    });
}
