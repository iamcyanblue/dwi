let sliderTrust, sliderVol, sliderSpeed, sliderConf, sliderHes;
let fieldTrust, fieldVol, fieldSpeed, fieldConf, fieldHes;
let save;
let play;
let jsonModel;
let updatedModel;
let recording;//contains the randomly selected .wav
let recordingList;
let playButtonLabel = "loading";
let playButton;
let volumeControl;

let trustRating, volRating, speedRating, confRating, hesitRating;

let socket;
socket = io.connect("http://localhost:3000");

function preload(){
  jsonModel = loadJSON("trustModel.json");
  recordingList = loadJSON("soundfiles.json", preLoadSound);
  console.log(recordingList);

  //the following is test code

  //need to be able to access a filename at random from soundfiles.json recordingList
  //but the jason file isn't in a structure that I can access...
  //console.log(recordingList[0].filename);
}

function preLoadSound(){

  //convert object to array by iterating through each element and pushing into empty array
  let recListArray =[]
  for(var i in recordingList){
  recListArray.push( recordingList[i].filename  );
  }

  console.log(recListArray);
  //choose a random number between 0 and recordingList.length -1
  let rnd = int(random(recListArray.length -1));
  console.log("recordingList.length is " + recListArray.length);
  console.log(rnd);
  let path = "upload/" + recListArray[rnd];
  console.log(path);
  //get that filename
  //preload the sound, with a call back to activate the play button
  recording = loadSound(path, soundLoaded);


}


function setup() {
  console.log("filename is: " + recordingList[0].filename);



  //create sound player

  play = createCanvas(400,100);
  play.id("soundPlayer");
  background(125);
  volumeControl = createSlider(0,1,0.5, 0.01);
  //volumeControl.parent("soundPlayer");





  //create trustworthiness input
  let trust = createDiv();
  let labelTrust = createP("Trustworthiness: ");
  sliderTrust = createSlider(0, 9, 5);
  sliderTrust.size(400);
  sliderTrust.input(()=> {
    fieldTrust.value(sliderTrust.value());
    labelTrust.html("Trustworthiness: " + sliderTrust.value());
  });
  fieldTrust = createInput(str(sliderTrust.value()));
  fieldTrust.size(50);
  labelTrust.parent(trust);
  sliderTrust.parent(trust);
  fieldTrust.parent(trust);


  //create volume input
  let vol = createDiv();
  let labelVol = createP("Volume");
  sliderVol = createSlider(0, 9, 5, 0);
  sliderVol.size(400);
  sliderVol.input(()=> {
    fieldVol.value(sliderVol.value());
  });
  fieldVol = createInput(str(sliderVol.value()));
  fieldVol.size(50);
  labelVol.parent(vol);
  sliderVol.parent(vol);
  fieldVol.parent(vol);


  //create speed input
  let speed = createDiv();
  let labelSpeed = createP("Speed");
  sliderSpeed = createSlider(0, 9, 5, 0);
  sliderSpeed.size(400);
  sliderSpeed.input(()=> {
    fieldSpeed.value(sliderSpeed.value());
  });
  fieldSpeed = createInput(str(sliderSpeed.value()));
  fieldSpeed.size(50);
  labelSpeed.parent(speed);
  sliderSpeed.parent(speed);
  fieldSpeed.parent(speed);


  //create confidence input
  let conf = createDiv();
  let labelConf = createP("Confidence");
  sliderConf = createSlider(0, 9, 5, 0);
  sliderConf.size(400);
  sliderConf.input(()=> {
    fieldConf.value(sliderConf.value());
  });
  fieldConf = createInput(str(sliderConf.value()));
  fieldConf.size(50);
  labelConf.parent(conf);
  sliderConf.parent(conf);
  fieldConf.parent(conf);



  //create hesitation input
  let hes = createDiv();
  let labelHes = createP("Hesitation");
  sliderHes = createSlider(0, 9, 5, 0);
  sliderHes.size(400);
  sliderHes.input(()=> {
    fieldHes.value(sliderHes.value());
  });
  fieldHes = createInput(str(sliderHes.value()));
  fieldHes.size(50);
  labelHes.parent(hes);
  sliderHes.parent(hes);
  fieldHes.parent(hes);

  //add a button to store the values
  save = createButton("Save");
  save.mousePressed(saveData);


  playButton = createButton("Please wait...");
  playButton.mousePressed(recordingListen);








}


function draw(){
  recording.setVolume(volumeControl.value());
  recording.play();
  //background(200);
  //textAlign(CENTER);
  //text(playButtonLabel, width/2, height/2);
}



function soundLoaded(){
  // d'oh - none of the page elements will have loaded yet, so can't cahnge html!
  // playButtonLabel = "Play";
  // playButton.html("hello");
  //playButton.html(playButtonLabel);
  //recording.play();
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

 socket.emit("hello", updatedModel);
}
