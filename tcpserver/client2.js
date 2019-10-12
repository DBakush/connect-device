var net = require('net'),
JsonSocket = require('json-socket');
 
var port = 3007; //The same port that the server is listening on
var host = '127.0.0.1';
var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket

var rpicr = {"request" : "RPICR","serial" : "dauserial","data" : {"ip" : "192.168.1.55","ncases" : "8","coordinates" : "(33.223344, 44.556677)","description" : "test dau"}};
var casecr = {"request" : "CASECR","serial" : "caseSerial","data" : {"dauserial" : "dauserial","coordinates" : "(33.223344,44.556677)","configuration" : ["sn1","sn2","sn3","sn4","sn5","sn6","sn7","sn8","sn9","sn10","sn11","sn12"],"description" : "first case","sensors":[{"serial_num" : "sn1","manufacturer" : "m1","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st1","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn2","manufacturer" : "m2","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "7664-41-7","sensorType" : "st2","unitOfMeasure" : "mgm3","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn3","manufacturer" : "m3","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "7782-44-7","sensorType" : "st3","unitOfMeasure" : "percentV","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn4","manufacturer" : "m4","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "67-56-1","sensorType" : "st4","unitOfMeasure" : "ppm","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn5","manufacturer" : "m5","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st5","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn6","manufacturer" : "m6","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st6","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn7","manufacturer" : "m7","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st7","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn8","manufacturer" : "m8","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st8","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn9","manufacturer" : "m9","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st9","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn10","manufacturer" : "m10","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st10","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn11","manufacturer" : "m11","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty","sensorType" : "st11","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "0"},{"serial_num" : "sn12","manufacturer" : "m12","dateOfManufacturer" : "11223344","swVersion" : "22","dateOfCalibration" : "11223344","casCode" : "qwerty12","sensorType" : "st12","unitOfMeasure" : "pcnt","upperLimit" : "100","lowerLimit" : "00"}]}};
var measr = {"request" : "MEASR","serial" : "caseSerial", "time" : "15:15:15", "data" : {"port1" : "6","port2" : "7","port3" : "32","port4" : "7","port5" : "9","port6" : "5","port7" : "3","port8" : "12","port9" : "7","port10" : "4","port11" : "2","port12" : "10"}};

socket.connect(port, host);
socket.on('connect', function() { //Don't send until we're connected
    


    //socket.sendMessage(rpicr);
    socket.sendMessage(casecr);
    //socket.sendMessage(measr);
    //setTimeout(function(){socket.sendMessage(casecr)}, 2000);
    //setTimeout(function(){socket.sendMessage(measr)}, 2000);

    socket.on('message', function(message) {
        console.log('The result is: ' + message[0].caseserial);
    });
});
