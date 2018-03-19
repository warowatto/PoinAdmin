const router = require('express').Router();
const db = require('../modules/database');
const hash = require('../modules/password');

router.post('/install/user', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let query = `SELECT * FROM Companys WHERE email = ? LIMIT 1`;

    db.query(query, [email])
        .then(result => {
            if(result[0]) {
                let user = result[0];
                hash.getHash(password, user.salt)
                    .subscribe(pw => {
                        if(pw == user.password) {
                            delete user.password;
                            delete user.salt;

                            res.status(200).json(user);
                        } else {
                            res.status(400).json({ error: 'not matched password' });
                        }
                    });
            } else {
                res.json(404).json({ error: 'not signed user' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'server error' });
        });
});

router.get('/machineType', (req, res)=> {
    let query = `SELECT * FROM MachineTypes`;

    db.query(query)
        .then(result => {
            res.status(200).json(result);
        });
});

router.post('/install/machine', (req, res) => {
    let machine = req.body;
    let query = `INSERT INTO Machines SET ?`;

    machine.create_at = new Date();

    db.query(query, [machine])
        .then(result => {
            if (result) {
                res.status(200).json({ success: true });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// 업체정보 가져오기
router.get('/user', (req, res) => {
    let query = `SELECT companyNumber, email, name, tel, phone, fax, address, bankName, accountNumber, accountName, paymentInfo FROM Companys WHERE id = ? LIMIT 1`;
    let companyId = req.session.passport.user.id;

    db.query(query, [companyId])
        .then(result => {
            let user = result[0];
            res.status(200).json(user);
        });
});

// 업체 상품 정보
router.get('/products', (req, res) => {
    let query = `SELECT * FROM Products WHERE companyId = ?`;
    let companyId = req.session.passport.user.id;

    db.query(query, [companyId])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// 상품등록하기
router.post('/product', (req, res) => {
    let product = req.body;
    delete product.visible;
    let query = `INSERT INTO Products SET ?`;
    let companyId = req.session.passport.user.id;

    product.companyId = companyId;
    product.create_at = new Date();

    db.query(query, [product])
        .then(result => {
            res.status(200).json({ sucess: true })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.get('/payments', (req, res) => {
    let companyId = req.session.passport.user.id;
    let query = `SELECT * FROM CompanyPayments WHERE companyId = ?`;

    db.query(query, [companyId])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// 장치 목록 가져오기
router.get('/machines', (req, res) => {
    let query = `SELECT * FROM Machines WHERE companyId = ? ORDER BY create_at DESC`;
    let companyId = req.session.passport.user.id;

    db.query(query, [companyId])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

// 장치 상태 변경
router.put('/machine', (req, res) => {
    let machine = req.body;
    let machineId = machine.id;
    delete machine.id;

    let query = `UPDATE Machines SET ? WHERE id = ?`;

    db.query(query, [machine, machineId])
        .then(result => {
            res.status(200).json({ scuccess: true });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// 상품 삭제
router.delete('/product/:id', (req, res) => {
    let machineId = req.params.id;
    let query = `DELETE FROM Products WHERE id = ?`;

    db.query(query, [machineId])
        .then(result => {
            res.status(200).json({ sucess: true });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
});

// 업체정보 변경
router.put('/user', (req, res) => {
    let params = req.body.params;
    let companyId = req.session.passport.user.id;
    
    delete params.email;

    let query = `UPDATE Companys SET ? WHERE id = ?`;

    db.query(query, [params, companyId])
        .then(result => {
            res.status(200).json({ success: true });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

// 상품별 종합 판매현황(PayOT 미결제 OR 결제 처리 사항)
router.get('/sellList/:start/:end/:state', (req, res) => {
    let startDate = req.params.start;
    let endDate = req.params.end;
    let state = req.params.state == 'true';
    
    let query = `
    SELECT
        Payments.productId as id,
        Products.name as name,
        COUNT(Payments.id) as counter,
        COUNT(DISTINCT machineId) as machines,
        SUM(defaultPrice) as total
    FROM Payments
    LEFT OUTER JOIN Products ON Products.id = Payments.productId
    WHERE 
        Payments.companyId = ? 
        AND Payments.sendToCompany = ?
        AND DATE(Payments.pay_at) >= ?
        AND DATE(Payments.pay_at) <= ?
    GROUP BY Payments.productId`;

    let companyId = req.session.passport.user.id;
    db.query(query, [companyId, state, startDate, endDate])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/all/:start/:end/:state', (req, res) => {
    let query = `
        SELECT
            *
        FROM Payments
        LEFT JOIN Machines ON Payments.machineId = Machines.id
        LEFT JOIN Products ON Payments.productId = Products.id
        WHERE
            Payments.companyId = ?
            AND Payments.sendToCompany = ?
            AND DATE(Payments.pay_at) >= ?
            AND DATE(Payments.pay_at) <= ?
        ORDER BY Payments.pay_at DESC`;

    let startDate = req.params.start;
    let endtDate = req.params.end;
    let state = req.params.state == 'true' ? 1 : 0;

    let companyId = req.session.passport.user.id;

    db.query(query, [companyId, state, startDate, endtDate])
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('../login');
});

module.exports = router;