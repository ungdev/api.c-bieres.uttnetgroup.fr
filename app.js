require('dotenv').config();

const mongoose = require('mongoose');
const Event = require('./models/Event');
const Beer = require('./models/Beer');

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const routes = require('./routes/routes');
routes(app);

app.listen(3000, function () {
  console.log('Server listening on port 3000!');
});
