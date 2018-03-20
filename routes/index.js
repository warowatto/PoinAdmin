const express = require('express');
const router = express.Router();
const db = require('../modules/database');

/* GET home page. */
router.get('/', function (req, res, next) {
  if (!req.session.passport) {
    res.redirect('/login');
  }
  res.render('dashboard', { title: 'Express' });
});

// 상품목록 가져오기
router.get('/product', (req, res) => {
  if (!req.session.passport) {
    res.redirect('/login');
  }

  res.render('product');
});

// 장치
router.get('/machine', (req, res) => {
  if (!req.session.passport) {
    res.redirect('/login');
  }

  res.render('machine');
});

// 장치 상품 등록
router.post('/install', (req, res) => {
  if (!req.session.passport) {
    res.redirect('/login');
  }

  let params = req.body;
  let query = `SELECT * FROM Products WHERE id IN (?)`;

  db.query(query, [params])
    .then(result => {
      res.render('install', result);
    })
    .catch(err => {
      res.render('error');
    });
});

router.get('/user', (req, res) => {
  if (!req.session.passport) {
    res.redirect('/login');
  }

  res.render('userinfo');
});

router.get('/table', (req, res) => {
  if (!req.session.passport) {
    res.redirect('/login');
  }

  res.render('sample-table');
});

module.exports = router;
