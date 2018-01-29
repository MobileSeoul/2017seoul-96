var express = require('express');
var formidable = require('formidable');
var db = require('../db')
var router = express.Router();

var LOADING_SIZE = 20;
var DEFAULT_USER_LATITUDE = 37.566229;
var DEFAULT_USER_LONGITUDE = 126.977689;
/*
//enterprise/info
router.post('/info', function(req, res, next) {
  if (!req.body.seq) {
    return res.sendStatus(400);
  }
  console.log("enterprise/info");

  var seq = req.body.seq;
  var type = req.body.type;
  var name = req.body.name;
  var addr = req.body.addr;
  var tel = req.body.tel;
  var bef = req.body.bef;
  var lat = req.body.lat;
  var lon = req.body.lon;

  var sql_insert = 
    "insert into enterprise (seq, type, name, addr, tel, bef, lat, lon) " +
    "values(?,?,?,?,?,?,?,?); ";

  console.log(sql_insert);

  var params = [seq, type, name, addr, tel, bef, lat, lon];

  db.get().query(sql_insert, params, function (err, result) {
    console.log(result.insertId);
    res.status(200).send('' + result.insertId);
  });
});
*/
/*
//enterprise/info/image
router.post('/info/image', function (req, res) {
  var form = new formidable.IncomingForm();

  form.on('fileBegin', function (name, file){    
    file.path = './public/img/' + file.name;
  });

  form.parse(req, function(err, fields, files) {
    var sql_insert = "insert into bestfood_info_image (info_seq, filename, image_memo) values (?, ?, ?);";

    db.get().query(sql_insert, [fields.info_seq, files.file.name, fields.image_memo], function (err, rows) {
      res.sendStatus(200);
    });
  });
});
*/


//enterprise/info
router.get('/info', function(req, res, next) {
  console.log("enterprise/info");
  var seq = req.query.seq;

  if (!seq) {
    return res.sendStatus(400);
  }

  var sql = 
    "select * " +       
    "from enterprise " +
    "where seq = ? ; ";
  console.log("sql : " + sql);
    
  db.get().query(sql, [seq], function (err, rows) {
      if (err) return res.sendStatus(400);;

      console.log("rows : " + JSON.stringify(rows));
      res.json(rows[0]);
  });      
});

//enterprise/list
router.get('/list', function(req, res, next) {
  console.log("enterprise/list");
  var seq = req.query.seq;
  var user_latitude = req.query.user_latitude || DEFAULT_USER_LATITUDE;
  var user_longitude = req.query.user_longitude || DEFAULT_USER_LONGITUDE;
  var order_type = req.query.order_type;
  var current_page = req.query.current_page || 0;

  if (!seq) {
    return res.sendStatus(400);
  }

  var order_add = '';

  if (order_type) {
    order_add = order_type + ' desc, user_distance_meter';
  } else {
    order_add = 'user_distance_meter';
  }

  var start_page = current_page * LOADING_SIZE;

  
  var sql = 
    "select a.*, " +
    "  (( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) )  " +
    "  + sin( radians(?) ) * sin( radians( latitude ) ) ) ) * 1000) AS user_distance_meter, " +
    "  if( exists(select * from bestfood_keep where seq = ? and info_seq = a.seq), 'true', 'false') as is_keep, " +
    "  (select filename from bestfood_info_image where info_seq = a.seq) as image_filename " +
    "from bestfood_info as a " +
    "order by  " + order_add + " " +
    "limit ? , ? ; ";
  console.log("sql : " + sql);
  console.log("order_add : " + order_add);

  var params = [user_latitude, user_longitude, user_latitude, seq, start_page, LOADING_SIZE];

  db.get().query(sql, params, function (err, rows) {
      if (err) return res.sendStatus(400);

      console.log("rows : " + JSON.stringify(rows));      
      res.status(200).json(rows);
  });
});

//enterprise/map/list
router.get('/map/list', function(req, res, next) {
  console.log("enterprise/map/list");
  var lat = req.query.latitude;
  var lon = req.query.longitude;
  var distance = req.query.distance;
  var user_latitude = req.query.user_latitude || DEFAULT_USER_LATITUDE;
  var user_longitude = req.query.user_longitude || DEFAULT_USER_LONGITUDE;
  var type = req.query.type || "*";

  
  if (!lat || !lon) {      
    return res.sendStatus(400);
  }
/*
  var sql = 
    "select a.*, " + 
    "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
    "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS distance_meter," + 
    "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
    "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS user_distance_meter " + 
    "from enterprise AS a " + 
    "where type = ?" +
    "having distance_meter <= ? " + 
    "order by user_distance_meter " ;
    
  var params = [lat, lon, lat, user_latitude, user_longitude, user_latitude, type, distance];
*/
  if(type !='*'){
    var sql = 
      "select a.*, " + 
      "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
      "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS distance_meter," + 
      "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
      "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS user_distance_meter " + 
      "from enterprise AS a " + 
      "where type = ?" +
      "having distance_meter <= ? " + 
      "order by user_distance_meter " ;
      
    var params = [lat, lon, lat, user_latitude, user_longitude, user_latitude, type, distance];
  } else{
  var sql = 
    "select a.*, " + 
    "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
    "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS distance_meter," + 
    "  (( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lon ) - radians(?) ) " + 
    "  + sin( radians(?) ) * sin( radians( lat ) ) ) ) * 1000) AS user_distance_meter " + 
    "from enterprise AS a " +
    "having distance_meter <= ? " + 
    "order by user_distance_meter " ;
    
  var params = [lat, lon, lat, user_latitude, user_longitude, user_latitude, distance];

  }



  console.log("sql : " + sql);
  console.log("lat : " + lat);
  console.log("lon : " + lon);
  console.log("distance : " + distance);
  console.log("type : " + type);


  db.get().query(sql, params, function (err, rows) {
      if (err) return res.sendStatus(400);

      console.log("rows : " + JSON.stringify(rows));      
      res.status(200).json(rows);
  });
});

//enterprise/list2
router.get('/list2', function(req, res, next) {
  var type = req.query.type;
  var district = req.query.district;
  var name = req.query.name;
  var typeadd = '';
  var districtadd = '';

    if(type!="전체업종"){
      typeadd = ' and type ="' + type+'"';
    }
    if(district!="'%전체지역%'"){
      districtadd = ' and addr like '+district;
    }

    var sql = 'select name, addr, type, seq '+
    'from enterprise '+
    'where name like '+name+typeadd+districtadd;

    console.log("sql : " + sql);
    db.get().query(sql, function (err, rows) {
      if (err) {
      return res.sendStatus(400);}

      console.log("rows : " + JSON.stringify(rows));      
      res.status(200).json(rows);
    });


});






module.exports = router;