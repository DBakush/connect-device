var net = require('net');
const {Client} = require('pg');

var JsonSocket = require('json-socket');

const client = new Client({
  user: 'iotserver',
  host: '127.0.0.1',
  database: 'iotplatform',
  password: 'm@inS3rver',
  port: 5432,
})

const rpi_status_query = {
  name: 'rpi_status',
  text: 'SELECT status FROM mga_dau WHERE dauserial = $1',
}

const get_cases_query = {
  name: 'get_cases',
  text: 'SELECT caseserial FROM cases WHERE dauserial = $1',
}

const rpi_set_status_query = {
  name: 'rpi_set_status',
  text: 'UPDATE mga_dau SET status = $1 WHERE dauserial = $2 RETURNING status',
} 

const case_update_casedata_query = {
  name: 'case_update_casedata',
  text: 'UPDATE cases SET coordinates = $3, configuration = $4, status = $5, Description =$6 WHERE (cases.dauserial = $1 AND cases.caseserial = $2) RETURNING status',
} 

const case_update_casedataoff_query = {
  name: 'case_update_casedataoff',
  text: 'UPDATE cases SET status = $3, Description =$4 WHERE (cases.dauserial = $1 AND cases.caseserial = $2) RETURNING status',
} 

const case_update_sensorsdata_query = {
  name: 'case_update_sensorsdata',
  text: 'UPDATE case_sensors SET sensorserial = $3, sensorinfo = $4 WHERE port = $1 AND caseSerial = $2 RETURNING sensorserial',
} 

const insert_measurements_query = {
  name: 'insert_measurements',
  text: 'INSERT INTO case_measurements (mtime, caseserial, measurements) VALUES ($1, $2, $3) RETURNING mtime',
} 
 
var port = 3007;
var server = net.createServer();
server.listen(port);

client.connect();
server.on('connection', function(socket) { //This is a standard net.Socket
    
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket

    socket.on('message', function(message) {
    	//console.log(message.request);
    	if(message.request == "RPICR"){
    		//console.log('Request of RPi is: '+ message.Serial);
			
			client.query(rpi_set_status_query, ['online', message.serial], (err, res) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	console.log(res.rows[0].status)		  	
				  }
				//client.end()
			})

			client.query(get_cases_query, [message.serial], (err, res2) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	var msg = [{response:"RSS"}].concat(res2.rows);
				  	socket.sendMessage(msg);
				  	console.log(msg)	
				  	//console.log(res2.rows[1].caseserial)	  	
				  }
				//client.end()
			})


    	}
    	else if(message.request == "CASECROFF"){
			client.query(case_update_casedataoff_query, [message.dauserial, message.serial, 'offline', 'manual description'], (err, res) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	//onsole.log(res.rows[0].status)
				  	//console.log("CSS")
				  	var msg = [{response:"CCSOFF"}].concat(res.rows);
				  	socket.sendMessage(msg);
				  }

			})
    	}
    	else if(message.request == "CASECR"){
    		//console.log("CASECR");
			client.query(case_update_casedata_query, [message.data.dauserial, message.serial, message.data.coordinates, message.data.configuration, 'online', 'manual description'], (err, res) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	//onsole.log(res.rows[0].status)
				  	//console.log("CSS")
				  	var msg = [{response:"CCS"}].concat(res.rows);
				  	socket.sendMessage(msg);
				  }

			})

    		//console.log(case_update_casedata_query)


			for (var i = 0; i<12 ; i++) {
				client.query(case_update_sensorsdata_query, [i+1, message.serial, message.data.sensors[i].serial_num, message.data.sensors[i]], (err, res) => {
					//console.log(case_update_sensorsdata_query)
					  if (err) {
					    console.log(err.stack)
					  } else {
					  	//console.log(case_update_sensorsdata_query)
					  	//console.log(res.rows[0].sensorserial)
					  	var msg = [{response:"SUS"}].concat(res.rows);
					  	socket.sendMessage(msg);
					  	//console.log(msg)	

					  }
					  
					//client.end()
				})

			}


			console.log('Request of Case is: '+ message.data.configuration);
    	}
    	else if(message.request == "MEASR"){

			client.query(insert_measurements_query, [message.time, message.serial,message.data], (err, res) => {
				  if (err) {
				    console.log(err.stack)
				  } else {
				  	console.log(res.rows[0])		  	
				  }
			})

    		console.log('Request of measurement is: '+ message.data.time);
    	}  
    	else
    		console.log(message);	  	
       // var result = message.a + message.b;
       // socket.sendEndMessage({result: result});
       //console.log(message.request);
    });


	/*client.connect();

	client.query('INSERT INTO cases (dauserial, caseserial, coordinates, configuration, status, description) VALUES (\'Serial1\' , \'Serial33\', \'(44,66)\', \'{"sensor88":"serial88"}\',\'onair\',\'description 88\')', (err, res) => {
	  console.log(err, res)
	})

	client.query('SELECT * from cases', (err, res) => {
	  console.log(err, res)
	  
	})
	
	client.end() */
});
