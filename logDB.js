var fs = require('fs')
var cron = require('node-cron');
var sensor = require("node-dht-sensor");

cron.schedule('0 */2 * * *', function(){
 fs.readFile('./dbAccess.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("Error reading db access file from disk:", err);
        return;
    }
    try {
      console.log("*********Reading dbAccess file.********************");
      const dbAccess = JSON.parse(jsonString);
      userName = dbAccess.userName;
      password = dbAccess.password;
      var mongo = require('mongodb');
      var MongoClient = require('mongodb').MongoClient;
      var url = "mongodb+srv://" + userName + ":" + password + "@cluster0-4r75h.mongodb.net/test?retryWrites=true&w=majority";

        sensor.read(22, 4, function(err, temperature, humidity) {
        if (!err) {
          tempCelcius = temperature;
          humidtyReading = humidity;
          console.log(temperature);
          
          var cToFahr = tempCelcius * 9 / 5 + 32;
          var timeDate = new Date();

          var growRoomReadings = {
            tempFarenheit: cToFahr, 
            tempCel: tempCelcius,
            humidity: humidtyReading,
            timeDate: timeDate
          };
          
          // make sure we have a reading before uploading to db
          if (growRoomReadings.tempCel !== null ) {
	    console.log("Inserting new data at " + timeDate);
            var MongoClient = require('mongodb').MongoClient;
            var url = "mongodb+srv://" + userName + ":" + password + "@cluster0-4r75h.mongodb.net/test?retryWrites=true&w=majority";

            MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("mydb");
              dbo.collection("indoor-garden").insertOne(growRoomReadings, function(err, res) {
                if (err) throw err;
                console.log("1 new reading inserted");
                db.close();
              });
            });
            
          }
        }
        
        });      
      console.log("************db url: " + url);
    } catch(err) {
        console.log('Error parsing JSON string for DB access file:', err)
    }
 })
});

