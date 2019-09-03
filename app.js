const cors = require('cors');
const chalk = require('chalk');
const config = require('config');
const express = require('express');

const app = express();


app.use(cors()); // Activation des cross-origin requests
app.set('view engine','pug');

//Configuration de la base de données
require('./lib/database');

//Configuration des modèles de la base de données
require('./models');

const routes = require('./routes');

app.use('/demo', routes.demo);
app.use('/shipments', routes.shipments);

const PORT = config.api.port || 4500;
app.listen(PORT, () => console.log(chalk.rgb(127,255,0)('Mon serveur est en fonction')));