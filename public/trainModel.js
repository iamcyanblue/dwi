let sliderTrust, sliderVol, sliderSpeed, sliderConf, sliderHes; // UI slider elements to rate sound
let fieldTrust, fieldVol, fieldSpeed, fieldConf, fieldHes; // input fields to display values
let save; // the button to upload ratings data to the server
let play; // the canvas containing the sound player
let jsonModel; // the loaded model of ratings
let updatedModel; // contains the updated json file to send to the server
let recording; //contains the selected .wav
let recordingList; // a register of all the soundfiles recorded and uploaded to the server
let playButtonLabel = "loading"; //the current state label of the play button...do I need it?
let playButton; // starts the sound playing
let volumeControl; // volume slider for sound
let recordingIsLoaded = false;

let volWords = ["inaudible", "quietest", "very quiet", "quiet", "normal", "normal", "slightly loud", "louder", "very loud", "loudest"];
let speedWords = ["slowest", "very slow", "slow", "slightly slow", "normal", "normal", "slightly fast", "fast", "very fast", "fastest"];
let confWords = ["very uncertain", "very uncertain", "uncertain", "uncertain", "normal", "normal", "assured", "assured", "very assured", "very assured"];
let hesWords = ["broken speech", "many pauses", "some pauses", "few pauses", "normal", "normal", "more fluent", "very fluent", "no pauses", "breathless"];
let container; // a DIV to contain everything


//stuff for visualiser
let volhistory = [];
let amp;

let trustRating, volRating, speedRating, confRating, hesitRating; //variables to store the values to add to model

let socket; // create a socket connection
socket = io.connect("http://localhost:3000"); //connect to the server so we can emit/send data

function preload(){
  jsonModel = loadJSON("trustModel.json"); //load the current training model in so we can add to it
  recordingList = loadJSON("soundfiles.json", preLoadSound); //the register of uploaded sound files, once it's loaded call preLoadSound
  //console.log(recordingList);
}

function preLoadSound(){

  //a load of code to parse the soundfile register
  //convert object to array by iterating through each element and pushing into empty array
  let recListArray =[];
  for(var i in recordingList){
  recListArray.push( recordingList[i].filename  );
  }

  //console.log(recListArray);
  //choose a random number between 0 and recordingList.length -1
  let rnd = int(random(recListArray.length -1));
  console.log("recordingList.length is " + recListArray.length);
  console.log(rnd);
  let path = "upload/" + recListArray[rnd];
  //console.log(path);
  //preload the sound, with a call back to soundLoaded once it's done
  recording = loadSound(path, soundLoaded);

}


function setup() {
  //console.log("filename is: " + recordingList[0].filename);

  container = createDiv();
  container.id("player");
  container.parent("mainWindow");




  //create sound player

  play = createCanvas(400, 50);
  background(36,56,140);
  play.id("soundPlayer");
  play.parent("player");

  amp = new p5.Amplitude();
  amp.setInput(recording);


  playButton = createButton("Play");
  playButton.id("playbutton");
  playButton.parent("player");
  playButton.addClass("disabled");
  playButton.mousePressed(togglePlaying);
  recording.onended(()=>playButton.html("Play"));// reset playbutton when finished playing

  let speakicon = createElement("img");
  speakicon.attribute("src", "images/speaker.png");
  speakicon.attribute("width", "30px");
  speakicon.attribute("height", "30px");
  speakicon.addClass("speaker-icon");
  speakicon.parent("player");


  volumeControl = createSlider(0, 1, 0.5, 0.01);
  volumeControl.id("volumeSlider");
  volumeControl.addClass("playVol");
  volumeControl.parent("player");



let controlGroup = createDiv();
controlGroup.id("controlGroup");
controlGroup.parent("mainWindow");

  //create trustworthiness input
  let trust = createDiv();
  trust.id("trustGroup");
  trust.parent("controlGroup");
  let labelTrust = createElement("h2","Trustworthiness: -");
  labelTrust.addClass("sliderLabel");
  sliderTrust = createSlider(0, 9, 5);
  sliderTrust.addClass("inputSlider");
  sliderTrust.size(400);
  sliderTrust.input(()=> {
    fieldTrust.value(sliderTrust.value());
    labelTrust.html("Trustworthiness: " + sliderTrust.value());
  });
  fieldTrust = createInput(str(sliderTrust.value()));
  fieldTrust.size(50);
  fieldTrust.addClass("sliderDisplay");
  labelTrust.parent(trust);
  sliderTrust.parent(trust);
  fieldTrust.parent(trust);

  let groupHead = createElement("h2", "Deciding Factors");
  groupHead.parent(trust);


  //create volume input
  let vol = createDiv();
  vol.id("volGroup");
  vol.parent("controlGroup");
  let labelVol = createP("Volume: normal");
  labelVol.addClass("sliderLabel");
  sliderVol = createSlider(0, 9, 5, 0);
  sliderVol.addClass("inputSlider");
  sliderVol.size(400);
  sliderVol.input(()=> {
    fieldVol.value(sliderVol.value());
    labelVol.html("Volume: " + volWords[floor(sliderVol.value())]);
  });
  fieldVol = createInput(str(sliderVol.value()));
  fieldVol.size(50);
  fieldVol.addClass("sliderDisplay");
  labelVol.parent(vol);
  sliderVol.parent(vol);
  fieldVol.parent(vol);


  //create speed input
  let speed = createDiv();
  speed.id("speedGroup");
  speed.parent("controlGroup");
  let labelSpeed = createP("Speed: normal");
  labelSpeed.addClass("sliderLabel");
  sliderSpeed = createSlider(0, 9, 5, 0);
  sliderSpeed.addClass("inputSlider");
  sliderSpeed.size(400);
  sliderSpeed.input(()=> {
    fieldSpeed.value(sliderSpeed.value());
    labelSpeed.html("Speed: " + speedWords[floor(sliderSpeed.value())]);
  });
  fieldSpeed = createInput(str(sliderSpeed.value()));
  fieldSpeed.addClass("sliderDisplay");
  fieldSpeed.size(50);
  labelSpeed.parent(speed);
  sliderSpeed.parent(speed);
  fieldSpeed.parent(speed);


  //create confidence input
  let conf = createDiv();
  conf.id("confGroup");
  conf.parent("controlGroup");
  let labelConf = createP("Confidence: normal");
  labelConf.addClass("sliderLabel");
  sliderConf = createSlider(0, 9, 5, 0);
  sliderConf.addClass("inputSlider");
  sliderConf.size(400);
  sliderConf.input(()=> {
    fieldConf.value(sliderConf.value());
    labelConf.html("Confidence: " + confWords[floor(sliderConf.value())]);
  });
  fieldConf = createInput(str(sliderConf.value()));
  fieldConf.size(50);
  fieldConf.addClass("sliderDisplay");
  labelConf.parent(conf);
  sliderConf.parent(conf);
  fieldConf.parent(conf);



  //create hesitation input
  let hes = createDiv();
  hes.id("hesGroup");
  hes.parent("controlGroup");
  let labelHes = createP("Hesitation: normal");
  labelHes.addClass("sliderLabel");
  sliderHes = createSlider(0, 9, 5, 0);
  sliderHes.addClass("inputSlider");
  sliderHes.size(400);
  sliderHes.input(()=> {
    fieldHes.value(sliderHes.value());
    labelHes.html("Hesitation: " + hesWords[floor(sliderHes.value())]);
  });
  fieldHes = createInput(str(sliderHes.value()));
  fieldHes.size(50);
  fieldHes.addClass("sliderDisplay");
  labelHes.parent(hes);
  sliderHes.parent(hes);
  fieldHes.parent(hes);

  //add a button to store the values
  save = createButton("Save");
  save.id("saveButton");
  save.parent("controlGroup");
  save.mousePressed(saveData);


  // playButton = createButton("Please wait...");
  // playButton.mousePressed(recordingListen);


}


function draw(){

  if (recording.isPlaying()){
  background(36,56,140);
    var vol = amp.getLevel();
    volhistory.push(vol);
    recording.setVolume(volumeControl.value());
    stroke(255);
    strokeWeight(2);
    noFill();


    push();
    var currentY = map(vol, 0, 1, height, 0);
    translate(0, height / -2);

    beginShape();
    for (var i = 0; i < volhistory.length; i++) {
      var y = map(volhistory[i], 0, 1, height, 0);
      vertex(i, y);
    }
    endShape();
    pop();


    if (volhistory.length > width) {
      volhistory.splice(0, 1);
    }

    stroke(0, 0, 100);
    line(volhistory.length, 0, volhistory.length, height);
}

    //enable button if sound is loaded
    if (recordingIsLoaded){
      //enable button
      playButton.attribute("class","enabled");
    }
}


function togglePlaying(){
  if (!recording.isPlaying()){
    recording.play();
    playButton.html("Pause");
  } else {
    recording.pause();
    playButton.html("Play");
  }
}


function ended(){
  console.log("ended");
}










function soundLoaded(){
  // enable the play button once the recording is loaded
  //playButton.addClass("disabled");
  recordingIsLoaded = true;
  console.log("enabled the button");
}


function recordingListen(){
  //temporary testing of sound
  recording.play();
}



function saveData() {

  //get the values from the sliders
  trustRating = fieldTrust.value();
  volRating = fieldVol.value();
  speedRating = fieldSpeed.value();
  confRating = fieldConf.value();
  hesitRating = fieldHes.value();

  //debugging stuff
  console.log("a vocal volume of " +  volRating);
  console.log("a vocal speed of " +  speedRating);
  console.log("a vocal confidence level of " +  confRating);
  console.log("a vocal hesitation amount of " +  hesitRating);
  console.log("equates an overall trust rating of: " +  trustRating);


  //push the ratings to the relevant trustlevel object in the JSON
  jsonModel.dataset[trustRating].volume.push(volRating);
  jsonModel.dataset[trustRating].speed.push(speedRating);
  jsonModel.dataset[trustRating].confidence.push(confRating);
  jsonModel.dataset[trustRating].hesitation.push(hesitRating);


  console.log("*********display*contents*of*jsonModel*********");
  //jsonModel.dataset[0].confidence.push(3.14);
  console.log(jsonModel.dataset[trustRating].volume);
  console.log(jsonModel.dataset[trustRating].speed);
  console.log(jsonModel.dataset[trustRating].confidence);
  console.log(jsonModel.dataset[trustRating].hesitation);

  console.log("------------------stringifying----------");
  updatedModel = JSON.stringify(jsonModel, null, 4);
  console.log(updatedModel);

 //send/emit the data to the server over the socket
 socket.emit("hello", updatedModel);
 alert("Dataset updated. Refresh to load a new vocal sample");
 //Window.alert("Dataset updated");
}
