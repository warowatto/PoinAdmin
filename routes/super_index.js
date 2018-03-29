const router = require('express').Router();

router.get('/', (req, res) => {
    res.redirect('/super/dashboard');
})

// 메인페이지
router.get('/dashboard', (req, res) => {
    res.render('super/dashboard');
});

// 업체 페이지
router.get('/company/:id', (req, res) => {
    res.render('super/company', { id: req.params.id });
});

// 장치 페이지
router.get('/machine/:id', (req, res) => {
    res.render('super/machine', { id: req.params.id });
});

// 대금 결제 리스트
router.get('/payment', (req, res) => {
    res.render('super_payment');
});

module.exports = router;