var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./db');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


db.connect(function(err) {
  console.log("db.connect() 실행");

  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  }
  else {
    console.log(" DB cnonected");
  }
});


// favicon을 /public에 넣고 주석 제거
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/member', require('./routes/member'));
app.use('/enterprise', require('./routes/enterprise'));



//404에러를 잡아서 에러 핸들링에 포워딩
app.use(function(req, res, next){
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//error handler
app.use(function(err,req,res,next){
  //로컬을 설정하고 개발 중의 오류를 제공
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development'? err:{};

  //에러 페이지 생성
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
