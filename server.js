/*
Mat Denney 2021
Server app for DWi project
*/

//-Setup express----------------------------------------------------------------

var express = require("express"); //this imports the entire express module
var app = express(); //we trigger the function (make an app) and store it in variable app
var server = app.listen(3000); //start listening on port 3000
app.use(express.static("public")); //redirect any GET requests to serve up files from /public directory
// try template literal?: `${__dirname}/public`
console.log("hi there - i'm a server"); //debug check message


//-Setup socket.io--------------------------------------------------------------

var socket = require("socket.io"); //import socket module and instantiate it in socket var
var io = socket(server); //connect it to the webserver

//-Setup edit-json-file---------------------------------------------------------
// const editJsonFile = require("edit-json-file");
// // If the file doesn't exist, the content will be an empty object by default.
// let file = editJsonFile(`${__dirname}/public/soundfiles.json`);
// Set a couple of fields
// file.set("filename", "123456789.wav");
// file.save();
// file.set("filename", "999999999.wav");
// file.save();


//-Setup multer and fs----------------------------------------------------------
const multer  = require('multer') //use multer to upload blob data
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files


//-stuff to handle incoming POST from form--------------------------------------

app.post('/upload', upload.single('soundBlob'), function (req, res, next) {
  // console.log(req.file); // see what got uploaded

  //let uploadLocation = __dirname + '/public/upload/' + req.file.originalname // where to save the file to. make sure the incoming name has a .wav extension
  let uploadLocation = `${__dirname}/public/upload/` + req.file.originalname // where to save the file to. make sure the incoming name has a .wav extension

  console.log('saving to ' + uploadLocation);


// -----------------------------------------------------------------------------
  //log teh filename to the json register for later access from other pages
  console.log('filename is: ' + req.file.originalname);

  // read the jsonfile
  fs.readFile('./public/soundfiles.json', 'utf8', (err, data) => {

      if (err) {
          console.log(`Error reading file from disk: ${err}`);
      } else {

          // parse JSON string to JSON object
          const databases = JSON.parse(data);

          // add a new record
          databases.push({
              filename: req.file.originalname
          });

          // write new data back to the file
          fs.writeFile('./public/soundfiles.json', JSON.stringify(databases, null, 4), (err) => {
              if (err) {
                  console.log(`Error writing file: ${err}`);
              }
          });
      }

  });









// -----------------------------------------------------------------------------

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
  res.sendStatus(200); //send back that everything went ok

})









//-Handle new connections-------------------------------------------------------

io.sockets.on("connection", newConnection); // call newConnection() on a new socket connection

function newConnection(someClient) {

  //-debug code logs to console when a client connects/disconnects
  console.log("new connection: " + someClient.id);

  someClient.on("disconnect", () => {
    console.log("Bye " + someClient.id);
  }); //-notice this has to go inside the sockets.on event callback function body

  //-Custom events from client handled here-------------------------------------

  someClient.on("hello", callbackFnc); //replace xxxxxx with custom client message, and plug in the callbackFnc

  //-template for a callback function called by the custom event handler above
  function callbackFnc(data) {
    console.log((data));

    fs.writeFile('./public/trustModel.json', data, (err) => {
      if (err) {
          console.log(`Error writing file: ${err}`);
      }
  });
  }

}
