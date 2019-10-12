var net = require('net');
const {Client} = require('pg');

//var JsonSocket = require('json-socket');

const client = new Client({
  user: 'iotserver',
  host: '127.0.0.1',
  database: 'iotplatform',
  password: 'm@inS3rver',
  port: 5432,
})

var options = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};

const put_mqtt_data = {
  name: 'put_data',
  text: 'INSERT INTO mqtt_data (devSerial, mtime, bat, p1_text, p1_float, p1_int, p2_text, p2_float, p2_int) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
}

const select_mqtt_topics = {
  name: 'select_mqtt_topics',
  text: 'SELECT topicname from mqtt_topics',
}
 
const select_info_mqtt_topics = {
  name: 'select_exact_mqtt_topics',
  text: 'SELECT * FROM mqtt_topics WHERE topicname = $1',
}

// updated controller.js
const mqtt = require('mqtt')
const mqttclient = mqtt.connect('mqtt://127.0.0.1',{port:3002})

client.connect();

var devSerial
var time
var bat
var p1_text
var p1_float
var p1_int
var p2_text
var p2_float
var p2_int 
var update_mqtt_topics_ind;
var topics = [];


//console.log("before connection")

mqttclient.on('connect', () => {
  //mqttclient.subscribe('vega_temperature')
  updateMqttTopicsAndSubscribe();
  update_mqtt_topics_ind = setInterval(updateMqttTopicsAndSubscribe,900000);
})

mqttclient.on('message', (topic, message) => {

	//узнать какие устройства привязаны к топику и выгрузить структуру топика: select_info_mqtt_topics
	// проверить, что структура сообщения соответствует данным в БД
	// вынуть из сообщения серийный номер устройства и проверить, что устройство зарегистрировано
	// вынуть из профиля устройства какие данные из сообщения нужны и в какие таблицы класть
	
  switch (topic) {
    case 'vega_temperature':
      return handleVegaMessage(message)
    //case 'garage/state':
    //  return handleGarageState(message)
  }
  console.log('No handler for topic %s', topic)
})



function handleVegaMessage (message) {
	msg = JSON.parse(message);
	
	let date = new Date();
	let y = date.getFullYear();
	let m = date.getMonth()+1;
	let d = date.getDate();
	let h = date.getHours();
	let min = date.getMinutes();
	let s = date.getSeconds();
	let sdate = "" + y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;
	let sldate = date.toLocaleString("ru", options);

	if (msg.Telemetry !== undefined){
		bat = parseInt(msg.Telemetry.bat, 10);
		p1_text = msg.LBS.LAC + "_" +msg.LBS.CID;
		p1_float = parseFloat(msg.Telemetry.temp);
		p1_int = parseInt(msg.Message.num, 10);
		p2_text = msg.LBS.MCC + msg.LBS.MNC;
		p2_float = parseFloat(msg.Telemetry.onewire[0]);
		p2_int = 0;
		devSerial = msg.Message.dev;

		console.log('Vega SG-1 sent message %s', msg.Telemetry)
	  
		client.query(put_mqtt_data, [devSerial, sdate, bat, p1_text, p1_float, p1_int, p2_text, p2_float, p2_int], (err, res) => {
				console.log(put_mqtt_data);
			  if (err) {
			    console.log(err.stack)
			  } else {
			  	console.log("OK")
			  }
		})

	}
	else{
		console.log('Bad data in mqtt message')
	}


}
function updateMqttTopicsAndSubscribe() {
	client.query(select_mqtt_topics, (err, res) => {
			//console.log(put_mqtt_data);
		  if (err) {
		    console.log(err.stack)
		  } else {
			let upd_date = new Date();
			let local_date = upd_date.toLocaleString("ru", options);
			let dbTopics = [];
			let newTopics = [];

			for (let j = 0 ; j < res.rows.length; j++) {
				dbTopics[j] = res.rows[j].topicname;
			}
			
			let isNewTopics = compare(topics, dbTopics)
			console.log("topics: " + topics);

			if(!isNewTopics){
				newTopics = diff(topics, dbTopics)
				topics = dbTopics;
				console.log("topics: " + topics)
				console.log("dbTopics.topicname: " + dbTopics)
				console.log("We have new topics: " + newTopics)
			}
			else {
				console.log("There is no new topics")
			}

		  	for (let i = 0 ; i < newTopics.length; i++) {
		  		mqttclient.subscribe(newTopics[i])
		  		console.log("Subscribed to: " + newTopics[i])
		  	}
			

		  	console.log(local_date + ": MQTT topics were updated during to timer: " + update_mqtt_topics_ind)
		  	
		  }	
	})	
}


function diff(a1, a2) {
		console.log(a1)
		console.log(a2)
	    return (a1.filter(i=>!a2.includes(i)).concat(a2.filter(i=>!a1.includes(i))))
	}
function compare (a1, a2) {
		console.log(a1)
		console.log(a2)
	    return a1.length == a2.length && a1.every((v,i)=>v === a2[i])
	}	