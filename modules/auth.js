const passport = require('passport');
const LocalStrege = require('passport-local').Strategy;
const db = require('./database');
const hash = require('./password');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    
    passport.use(new LocalStrege({
        usernameField: 'email',
        passwordField: 'pass',
        session: true,
        passReqToCallback: false },
        (email, pass, done) => {
            let query = `SELECT * FROM Companys WHERE email = ?`;
            db.query(query, [email])
                .then(result => {
                    if (result[0]) {
                        hash.getHash(pass, result[0].salt)
                            .subscribe(
                                results => {
                                    if (result[0].password == results) {
                                        delete result[0].password;
                                        delete result[0].salt;
                                        done(null, result[0]);
                                    } else {
                                        console.log('여기로 들어와??');
                                        done(null, false, { message: '비밀번호가 다릅니다' });
                                    }
                                }, 
                                err => {
                                    done(null, false, { message: '서버 오류 입니다' });
                                });
                    } else {
                        done(null, false, { message: '존재하지 않는 업체 입니다' });
                    }
                })
                .catch(err => {
                    done(null, false, { message: '서버 오류 입니다' });
                });
        }
    ));
}