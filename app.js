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
const bodyParser = require('body-parser');

// connect to BDD
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);

// configure upload path
const storage = multer.diskStorage({
  	destination: process.env.UPLOAD_PATH,
	filename(req, file, cb) {
		cb(null, file.originalname);
	}
});
const upload = multer({ storage });

// middlewares
app.use(bodyParser.json());
app.use(cors());

// static files
app.use(express.static('public'));

// middlewares to upload beer pictures
app.put('/api/beer/:id', upload.single('file'), function (req, res, next) {
	next();
});
app.post('/api/beer', upload.single('file'), function (req, res, next) {
	next();
});

// register api routes
const routes = require('./config/routes');
routes(app);

app.listen(3000, function () {
    console.log('Server listening on port 3000!');
});
