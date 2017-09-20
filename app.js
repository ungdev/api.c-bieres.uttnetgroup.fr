require('dotenv').config();

const mongoose = require('mongoose');
const Event = require('./models/Event');
const Beer = require('./models/Beer');
const Drinker = require('./models/Drinker');
const Admin = require('./models/Admin');

const express = require('express');
const app = express();
const cors = require('cors');

const multer = require('multer');

const storage = multer.diskStorage({
  	destination: process.env.UPLOAD_PATH,
	filename(req, file, cb) {
		cb(null, file.originalname);
	}
});
const upload = multer({ storage });

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);

app.use(cors());
app.use(express.static('public'));

// middlewares to upload beer pictures
app.post('/api/beer', upload.single('file'), function (req, res, next) {
	next();
});
app.put('/api/beer', upload.single('file'), function (req, res, next) {
	next();
});

const routes = require('./routes/routes');
routes(app);

app.listen(3000, function () {
    console.log('Server listening on port 3000!');
});
