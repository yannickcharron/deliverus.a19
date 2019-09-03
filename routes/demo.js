const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200);
    res.end('Bonjour de mon serveur Express');
});

router.get('/test4', (req, res, next) => {
    res.status(200);
    res.end('Ma route de test');
});

router.get('/pug', (req, res, next) => {
    res.render('simple', {title: 'Allo', message:'Mon message de pug'});
});

module.exports = router;