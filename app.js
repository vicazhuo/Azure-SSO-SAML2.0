var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var fs = require('fs');

// SAML strategy

var SamlStrategy = require('passport-saml').Strategy;
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});
passport.use(new SamlStrategy(
    {
        // path: '/login/callback',
        entryPoint: 'https://login.microsoftonline.com/003eb209-7464-4ea7-a971-ae1d22b94ab4/saml2',
        issuer: 'APM-Platform-SSO',
        callbackUrl: 'https://platform.apmgroup.net/login/callback',
        // cert: fs.readFileSync('./SampleSAMLApp.cer', 'utf-8'),
        cert: 'MIIC8DCCAdigAwIBAgIQOqfSt8cmioJOjCIEHhlWfzANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMjEyMTkwOTU5NTBaFw0yNTEyMTkwOTU5NTBaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsP/CxZVLgMPbVGVtACj1YY+zPjT66N7m2c8Qf9Hv/ORAqF6tBDHbSq8zWd0A7Rd53ndFTIdwpC64pN1zrtlBox8v0FRwL2u4VQbauwKThYbw3DObGgzRFxmTJWz08WfztJMUX4kGFu4lyIN+pPfYYuJe9RcK8TKBe7cz5qkSYMNInnrsy28GgH5g4DnWm/K3OK+umjfHqxnjIIANoSl3NNRsbXfyvdch+qnoqxc1j8FeRkA9dqFG+kxsZT6C2Kw/3JWEBti2b0uVpj5Fs9WiMpgB5D8KsUU6o+8RL/6ha1wQz8OT1Sz/jWQhqptL9jFkzBTRkdZGe8gDcFyJD3QjKQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA15cBLtNogWsKw5nj7p/oyBV03RXex9QYHlexwK/+2HDakUs1CeRNiytHo2/Oay+qzup2KO6ewe9buKRD0ASrHfuZBSN/YuEqgv6U+E6I66aeBZZCCVv2V9RA+Zs3ccuMS2+CxuepAhRW7NDAjM6RN5FkULB46nEWJnJen8bn9HJNd7ubZQfrUvjblkS3XE9E2Ws8Tu5gmcK7dGsO92XQpBYP0stRdz1F6PrGJ9vJAenUg4N4rE0T1he75u4L3RnhlJlXpMye0E87lvaiKlLZgVHSYLuVC4juiZcNbi/zg0BDZ0VFZTNykzYeGyQM94vD8sEBeSHA85wRAaKhg+gPK',
        // authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
        identifierFormat: null
        // signatureAlgorithm: 'sha256'
    },
    function (profile, done) {
        return done(null,
            {
                id: profile['nameID'],
                email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                displayName: profile['http://schemas.microsoft.com/identity/claims/displayname'],
                firstName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
                lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']
            });
    })
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(session(
    {
        resave: true,
        saveUninitialized: true,
        secret: 'sample SAML App'
    }));
app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/login',
    passport.authenticate('saml', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
);
app.post('/login/callback',
    passport.authenticate('saml', {
        failureRedirect: '/',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    }
);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
