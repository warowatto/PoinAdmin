var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Express' });
});

router.get('/table', (req, res) => {
  res.render('sample-table');
});

module.exports = router;
