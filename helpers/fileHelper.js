const fs = require('fs.extra');

/**
 * Take the uploaded beer image and move it
 * into the public directory
 *
 * @param {file}
 * @return {Promise}
 */
 function saveUploadedBeerImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve();

        fs.copy(file.path, "public/beers/" + file.originalname, { replace: true },  err => {
            if (err) reject(err);
            resolve("beers/" + file.originalname);
        });

    });
}

function deleteBeerImage(path) {
    return new Promise((resolve, reject) => {
        if (!path) resolve();

        // check if file exists (else, throw an error)
        fs.exists(path, exists => {
            if (!exists) resolve();

            fs.unlink("public/" + path, err => {
                if (err) reject(err);
                resolve();
            });
        });
    });
}

function deleteBeerImages(paths) {
    return new Promise((resolve, reject) => {
        Promise.all(paths.map(path => deleteBeerImage(path)))
            .then(_ => resolve())
            .catch(err => reject(err));
    });
}

module.exports = {deleteBeerImages, deleteBeerImage, saveUploadedBeerImage};
