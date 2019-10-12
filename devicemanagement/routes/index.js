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
  user: 'iotserver',
  host: '127.0.0.1',
  database: 'iotplatform',
  password: 'm@inS3rver',
  port: 5432,
})
client.connect();

const put_device = {
  name: 'put_device',
  text: 'INSERT INTO devices (devserial, username, manufacturer, profile, status, description) VALUES ($1, $2, $3, $4, $5, $6)',
}
const update_mqtt = {
  name: 'update_mqtt',
  text: 'INSERT INTO mqtt_topics (topicname, format, device_list, manufacturers_list) VALUES ($1, $2, $3, $4)',
}
const put_new_device_config = {
  name: 'put_new_device_config',
  text: 'INSERT INTO configurations (devSerial, config) VALUES ($1, $2)'
}
const get_userid = {
  name: 'get_userid',
  text: 'SELECT uid FROM users WHERE username = $1'
}
const get_deviceSerial = {
  name: 'get_deviceSerial',
  text: 'SELECT devSerial FROM devices WHERE username = $1'
}
const get_profileNames = {
  name: 'get_profileNames',
  text: 'SELECT profilename FROM device_profiles'
}

const get_profile_protocol = {
  name: 'get_profile_protocol',
  text: 'SELECT protocol FROM device_profiles WHERE profilename = $1'
}

/* GET home page. */
router.get('/', function(req, res, next) {

// Запрос данных о производителях, профилях, конфигурациях, протоколах


  res.render('index', { title: 'Express' });

});

router.post('/putdevice', function(req, res, next) {


	let devSerial = req.body.ds;
	let username = req.body.un;
	let profile = req.body.pr;
	let manufacturer = req.body.mf;
	let description = req.body.dsc; 
	let status = "offline";
	let uid = "";
	let user_reg = 0;
	let response = "";
	let dev_in_db = 0;
	let profileProtocol = "";

/*
	console.log(devSerial);
	console.log(username);
	console.log(manufacturer);
	console.log(profile);
	console.log(status);
	console.log(description);
*/
	
	client.query(get_userid, [username], (err, gidRes) => {
		  
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	console.log(gidRes.rows[0]);
		    if (gidRes.rows[0]){
		    	user_reg = 1;

				client.query(get_deviceSerial, [username], (err, gdRes) => {
					  if (err) {
					    console.log(err.stack)
					  } else {
					  	result = gdRes.rows
					  	for (let i = 0 ; i < result.length; i++) {

					  		if(result[i].devserial == devSerial){
					  			dev_in_db = 1;
					  		}
					  	}
					  	if(dev_in_db < 1){
							client.query(put_device, [devSerial, username, manufacturer, profile, status, description], (err, pdRes) => {
								  if (err) {
								    console.log(err.stack)
								  } else {
								  	console.log("New device added in Database")
								  }
								})

							client.query(get_profile_protocol, [profile], (err, gppRes) => {
								  if (err) {
								    console.log(err.stack)
								  } else {										  							  	
								  	profileProtocol = gppRes.rows[0].protocol;
								  	
									if(profileProtocol == "mqtt"){
												let topic_name = "";
												// Настройки MQTT по умолчанию. Могут быть изменены при загрузке файла json с настройками в форме добавления нового устройства
												topic_name += manufacturer + "/" + devSerial;
												let topic_format = {data : ''}
												let device_list = {devices : [devSerial]}
												let manufacturer_list = {manufacturers : [manufacturer]}
												// Конец настроек MQTT по умолчанию

												client.query(update_mqtt, [topic_name, topic_format, device_list, manufacturer_list], (err, umRes) => {
													  if (err) {
													    console.log(err.stack)
													  } else {
													  	console.log("mqtt topics were updated")	
													  }
													})
																				
											}
											else if(profileProtocol == "http"){
												//Если протокол http, то выполняем обновление каких-либо данных при необходимости
											}
								  }
								})							

		

					  		}
					  		else{
					  			response = "This device alredy in database";
					  		}
					  }
					})		    	

		    }
		    else {
		    	response = "This user does not registered";
		    	user_reg = 0;
		    }
		    res.render('index', { msg: 'message:' + response });
		  	//res.send(response);
		  	//response += uid; 
		  }
		  
		})

	/*client.query(get_profilenames, (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	console.log("All Profiles: " + res.rows[0].profilename)
		  	uid = res.rows[0].uid;
		  }
		})	*/
	

	
/*
	client.query(update_mqtt, [devSerial, uid, profile, status, description], (err, res) => {
		  if (err) {
		    console.log(err.stack) 
		  } else {
		  	console.log("OK")
		  	//console.log("CSS")
		  	//var msg = [{response:"CCSOFF"}].concat(res.rows);
		  	//socket.sendMessage(msg);
		  }

	client.query(put_new_device_config, [devSerial, uid, profile, status, description], (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	console.log("OK")
		  	//console.log("CSS")
		  	//var msg = [{response:"CCSOFF"}].concat(res.rows);
		  	//socket.sendMessage(msg);
		  }		 */ 
		  
	})

module.exports = router;
