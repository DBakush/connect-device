var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser')

var fs = require('fs');  

var net = require('net');
const {Client} = require('pg');

var options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};

const client = new Client({
  user: 'pi',
  host: '127.0.0.1',
  database: 'posdata',
  password: 'UniPi1987',
  port: 5432,
})
client.connect();

const put_data = {
  name: 'put_data',
  text: 'INSERT INTO measurements (devSerial, mtime, p1, p2, p3, p4, p5, p6, p7) VALUES ($9, $8, $1, $2, $3, $4, $5, $6, $7)',
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/putdata', function(req, res, next) {

	//Добавить в парсинг строки запроса идентификатор устройства
	//проверить зарегистрировано ли устройство
	//вынуть из БД профиль устройства, формат данных, в какие таблицы класть данные
	//положить данные в таблицы

	let p1, p2, p3, p4, p5, p6, p7, p8 =0;
	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth()+1;
	let d = date.getDate();
	let h = date.getHours();
	let min = date.getMinutes();
	let s = date.getSeconds();
	let sdate = "" + y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;
	let sldate = date.toLocaleString("ru", options);
	let devSerial = "";


	/*console.log(sdate)
	console.log("Parameter 1: " + req.body.p1);
	console.log("Parameter 2: " + req.body.p2);
	console.log("Parameter 3: " + req.body.p3);
	console.log("Parameter 4: " + req.body.p4);
	console.log("Parameter 5: " + req.body.p5);
	console.log("Parameter 6: " + req.body.p6);
	console.log("Parameter 7: " + req.body.p7);
	console.log("Parameter 8: " + req.body.p8);*/
	p1 = parseFloat(req.body.p1);
	p2 = parseFloat(req.body.p2);
	p3 = parseFloat(req.body.p3);
	p4 = parseFloat(req.body.p4);
	p5 = parseFloat(req.body.p5);
	p6 = parseFloat(req.body.p6);
	p7 = parseFloat(req.body.p7);
	p8 = parseFloat(req.body.p8);
	devSerial = "firstDevice";


// --- выбор таблицы куда складывать данные должен зависеть от группы устройства, серийного номера




	client.query(put_data, [p1, p2, p3, p4, p5, p6, p7, sldate, devSerial], (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	console.log("OK")
		  	//console.log("CSS")
		  	//var msg = [{response:"CCSOFF"}].concat(res.rows);
		  	//socket.sendMessage(msg);
		  }

	})	
//--------------------------------------------------------------------------------------------

	//res.json("OK");
  //res.render('index', { title: 'Express' });
});



module.exports = router;
