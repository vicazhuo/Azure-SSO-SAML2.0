var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  if(req.isAuthenticated()) {
    let info = JSON.stringify( req.user)
    res.render('index', {data: info,isAuth:true});
  }else {
    res.render('index', {isAuth: null});

  }

});

module.exports = router;
