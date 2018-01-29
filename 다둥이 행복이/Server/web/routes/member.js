var express = require('express');
var db = require('../db')
var router = express.Router();
var formidable = require('formidable');

//member/:member_id
router.get('/:member_id', function(req, res, next) {
  console.log('/:member_id 동작');
  var member_id = req.params.member_id;
  
  var sql = "select * " +
            "from member " + 
            "where member_id = ? limit 1;";  
  console.log("sql : " + sql);    
  
  db.get().query(sql, member_id, function (err, rows) {
      console.log("rows : " + JSON.stringify(rows));
      console.log("row.length : " + rows.length);
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        res.sendStatus(400);
      }
  });
});

//member/member_id
router.post('/member_id', function(req, res) {
  console.log('/member_id 동작');

  var member_id = req.body.member_id;

  var sql_count = "select count(*) as cnt " +
            "from member " + 
            "where member_id = ?;";  
  console.log("sql_count : " + sql_count);

  var sql_insert = "insert into member (member_id) values(?);";
    
  db.get().query(sql_count, member_id, function (err, rows) {
    console.log(rows);
    console.log(rows[0].cnt);

    if (rows[0].cnt > 0) {
      return res.sendStatus(400);
    }
     //id조회 결과가 없으면 insert 시키는 부분
     db.get().query(sql_insert, member_id, function (err, result) {
       console.log(err);
       if (err) return res.sendStatus(400);
       res.status(200).send('' + result.insertId);
     });
  });
});

//member/info
router.post('/info', function(req, res) {
  console.log('/info 동작');
  var id = req.body.id;
  var pw = req.body.pw;
  var age = req.body.age;
  var phone_num = req.body.phone_num;
  var nickname = req.body.nickname;
  var car_model = req.body.car_model;
  var charge_type = req.body.charge_type;


  console.log({id, pw, age, phone_num, nickname, car_model, charge_type});

  var sql_count = "select count(*) as cnt " +
            "from member " + 
            "where phone_num = ?;";

  var sql_insert = "insert into member (member_id, member_pw, age, phone_num, nickname, car_model, charge_type) values(?, ?, ?, ?, ?, ?, ?);";
  var sql_update = "update member set member_id = ?, member_pw = ?, age = ?, phone_num = ?, nickname = ?, car_model = ?, charge_type = ? where member_id = ?; ";
  var sql_select = "select member_id from member where phone_num = ?; ";
  
  db.get().query(sql_count, phone_num, function (err, rows) {
    if (rows[0].cnt > 0) {
      console.log("sql_update : " + sql_update);

      db.get().query(sql_update, [id, pw, age, phone_num, nickname, car_model, charge_type, id], function (err, result) {
        if (err) return res.sendStatus(400);
        console.log(result);

        db.get().query(sql_select, phone_num, function (err, rows) {
          if (err) return res.sendStatus(400);

          res.status(200).send('' + rows[0].id);
        });
      });
    } else {
      console.log("sql_insert : " + sql_insert + ", id=" + id);

      db.get('member').query(sql_insert, [id, pw, age, phone_num, nickname, car_model, charge_type], function (err, result) {
        if (err) return res.sendStatus(400);

        res.status(200).send('' + result.insertId);
      });
    }
  });
});

//member/icon_upload
router.post('/icon_upload', function (req, res) {
  var form = new formidable.IncomingForm();

  form.on('fileBegin', function (name, file){
    file.path = './public/member/' + file.name;
  });

  form.parse(req, function(err, fields, files) {
    var sql_update = "update member set member_icon_filename = ? where seq = ?;";

    db.get().query(sql_update, [files.file.name, fields.member_seq], function (err, rows) {
      res.sendStatus(200);
    });
  });
});


module.exports = router;
