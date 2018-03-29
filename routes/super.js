const router = require('express').Router();
const db = require('../modules/database');
const moment = require('moment');
const groupArray = require('group-array');

moment.prototype.now = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

// 대금 결제 업체 조회
router.get('/dashboard', (req, res) => {
    let query = `
    SELECT 
        Companys.id as id,
        Companys.name as name
    FROM Payments
    LEFT OUTER JOIN Companys ON Companys.id = Payments.companyId
    WHERE
        sendToCompany = false
    GROUP BY Payments.companyId`;

    db.query(query)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

// 업체정보
router.get('/company/:id', (req, res) => {
    let id = req.params.id;

    let query = `
    SELECT 
        Products.name,
        Payments.productId,
        Products.machinePrice,
        Products.price,
        Payments.amount,
        COUNT(Payments.id) as count,
        (price = machinePrice) as priceType,
        GROUP_CONCAT(CONCAT(Payments.id)) as ids
    FROM Payments
    LEFT OUTER JOIN Products ON Products.id = Payments.productId
    WHERE 
        Payments.companyId = ? 
        AND 
        sendToCompany = false
    GROUP BY Payments.productId
    ORDER BY Products.name DESC`;

    let company = `SELECT * FROM Companys WHERE id = ?`;
    let machine = `SELECT * FROM Machines WHERE companyId = ?`;

    Promise.all([
        db.query(company, [id]),
        db.query(machine, [id]),
        db.query(query, [id])
    ]).then(result => {
        let response = {
            company: result[0][0],
            machines: result[1],
            sells: result[2]
        }

        delete response.company.password;
        delete response.company.salt;

        res.status(200).json(response);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

// 모든 장치 판매 정보 조회
router.get('/machine/:id', (req, res) => {
    let id = req.params.id;
    let query = `
    SELECT 
        * 
    FROM Payments 
    LEFT OUTER JOIN Products ON Products.id = Payments.productId
    LEFT OUTER JOIN Machines ON Machines.id = Payments.machineId
    WHERE machineId = ?`;
    
    db.query(query, [id])
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

// 업체 결제 진행
router.post('/payment', (req, res) => {
    
    // 결제 대상을 지정하고
    let companyId = req.body.companyId; // 업체 아이디
    let title = req.body.title; // 결제시 타이틀
    let description = req.body.description; // 결제시 부가 설명
    let amount = req.body.amount; // 결제 가격

    let paymentIds = req.body.paymentIds; // 결제 아이디

    console.log(paymentIds);
    let inputParams = {
        companyId: companyId,
        title: title,
        description: description,
        amount: amount,
        pay_at: moment().now()
    };

    let insertQuery = `INSERT INTO CompanyPayments SET ?`;
    let updateQuery = `UPDATE Payments SET sendToCompany = true WHERE id IN (?)`;

    db.query(updateQuery, [paymentIds])
        .then(result => {
            return db.query(insertQuery, [inputParams]);
        })
        .then(result => {
            res.status(200).json({ result: 'ok' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
})

module.exports = router;