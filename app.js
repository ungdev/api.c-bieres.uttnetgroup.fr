require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const oauthRoutes = require('./routes/oauth');

app.use(cors());

app.use('/api/oauth', oauthRoutes);

app.listen(3000, function () {
  console.log('Server listening on port 3000!');
});