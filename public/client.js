// TO DO
// ---------------------------------------------------------------------------
// add response page 1.2.6
// disable buttons until option is clicked
//
// nice to have: use setTimeout to advance questions
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

// socket connection stuff

let socket;
socket = io.connect("http://localhost:3000");

// app logic variables
//let socket; //object for the socket connection - do I need this?
let count = 0; //how many questions asked by app
let askedQuestions = []; //when question asked, record in this array
let currentQuestion; //the current question
let maxQuestions = 10; //max number of questions to ask
let numQuestions; //a count of how many questions in teh JSON file
let questionData; //holds the loaded JSON question data
let questions //a reference to root level of XML file
let scoresTable = null; //a csv table of latest scores from the trainer module
let clientAnswers = []; //an array of questionID : answerID objects for each answer
let answersDictionary; //will store the answers as question#/answer# pairs
let threshold = 50; //tune this number. anything below is accept, above is deny
let timer; //a timer object
let date = Date.now();//generate a timestamp which we'll use as a unique filename for the soundfile
let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "J"];


//structural page elements
let startButton; //starts the assessment
let radio; //radio group to hold the answer options
let radioOption; //question selection radio button
let nextButton; //loads the next question
let recButton;
let submitButton; //submits answers
let questionPara; //element that holds current question
let questionHead; //element that holds current question heading
let introHead; //the heading text on intro page
let introPara; //the introductory preamble text
let mainDiv; //a DOM element that groups the question, options and next button
let progress; //a div containing num/of questions
let agreeCheckbox; //a checkbox to accept terms
let pageElements; //a temp "clipboard" to put page UI on so we can remove

//sound recording pageElements
let mic, recorder, soundFile;
let state = 0; // mousePress will increment from Record, to Stop, to Play

function preload() {
  questionData = loadJSON("questions.json"); //load questions data
  scoresTable = loadTable("scores.csv"); //load live scores from server
  //timer(reset);
}



function setup() {
  noCanvas();
  questions = questionData.questions; //a shortcut to root level of questions
  numQuestions = questions.length; //how many questions in JSON file
  console.log("no. of questions in questions.json: " + numQuestions);
  console.log("no. of rows in scores.csv: " + scoresTable.getRowCount());
  console.log("no. of cols in scores.csv: " + scoresTable.getColumnCount());

  //socket = io.connect("http://localhost:3000");
  //socket.on("xxxxxx", callbackFnc); //if this sketch receives a custom event msg called xxxxxx, run callbackFnc

  answersDictionary = createStringDict("", ""); //temp key/value pair of 9999 is workaround
  //answersDictionary.clear(); //now empty the dictionary of temp initialisation values
  displayStartPage(); //display page #1.2.1

  // setup the audio recording stuff--------------------------------------------

  // create an audio in
  mic = new p5.AudioIn();
  // users must manually enable their browser microphone for recording to work properly!
  mic.start();
  // create a sound recorder
  recorder = new p5.SoundRecorder();
  // connect the mic to the recorder
  recorder.setInput(mic);
  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();

}



function displayStartPage() {
  //---create start page #1.2.1
  mainDiv = createDiv(); //parent element
  mainDiv.parent("content");
  mainDiv.id("introBlock");
  //mainDiv.addClass("intro");

  introHead = createElement("h1", "Your interview");
  introHead.parent(mainDiv);
  //introHead.addClass("intro");

  introPara = createP("You will be asked a series of questions about your day to day condition. Choose the answer that most closely describes your abilities. We will assess your condition based on this interview and make a decision on your eligibility for AbleFare.<br/> <b>Please Note:</b> Your support payments may be stopped if you do not complete this interview and submit it for processing.");
  introPara.parent(mainDiv);
  introPara.addClass("textBlock");


  startButton = createButton("Start");
  startButton.parent(mainDiv);
  //startButton.addClass("intro");
  startButton.mousePressed(initAssessment); //starts assessment on mouseClick
  //-end of function
}



function initAssessment() {

  //--!!!!!!!!!!!!!! make sure all variables reset to default/zero
  //-a prelaunch function
  answersDictionary.clear(); //clear out any old answers
  //---------------------------------

  pageElements = selectAll("#introBlock"); //add any introBlock UI elements to the pageElements array
  clearPage();

  //intro done, now launch interview
  questionBuild();

}

function questionBuild() {
  //---create question page(s) #1.2.2
  //console.log("start building questions");


  if (count >= maxQuestions) {
    // if we've we reached the maxQuestions limit
    console.log("we've asked all the questions");
    questionEnd();
  }


  //-choose a question at random
  currentQuestion = generateRandom(numQuestions); // generate random number between 0 and numQuestions
  console.log("proposed question num is: " + currentQuestion);

  //-check it hasn't been asked yet

  if (count == 0) { // is count = 0? e.g. no questions asked yet and it's the first one
    askedQuestions.push(currentQuestion); //add currentQuestion to askedQuestions[] array
  } else {
    checkNumber(currentQuestion); //see if it's been asked
  }

  count++; //increment the counter
  console.log("counter is: " + count);




  //- build the page elements
  //
  // create an empty DIV: mainDiv
  // give it an #id

  mainDiv = createDiv(); //parent element
    mainDiv.parent("content");
  mainDiv.id("contentBlock");
  mainDiv.addClass("questionBlock");

  // create teh question heading
  questionHead = createElement("h1", "Question " + count);
  questionHead.id("questionH1");
  questionHead.parent(mainDiv);

  // create the question para
  questionPara = createElement("p", questions[currentQuestion].questionText); //create a <p> containing the question
  questionPara.id("questionText"); //give it an ID for CSS
  questionPara.parent(mainDiv); //parent to mainDiv

  // create the answer options
  radio = createRadio(); //create the radio group
  radio.id("options"); //give it an ID for CSS
  radio.addClass("questionBlock"); //CSS class questionBlock will be a way to selectAll() when clearing screen
  radio.parent(mainDiv); //parent it to mainDiv
  radio.changed(radChoose);

  // iterate through options

  for (let i = 0; i < questions[currentQuestion].options.length; i++) {
    let aID = questions[currentQuestion].options[i].answerID; //answerID
    let aText = questions[currentQuestion].options[i].answerText; //answer text

    // radioOption = radio.option(questions[currentQuestion].options[i].answerID, questions[currentQuestion].options[i].answerText);

    radioOption = radio.option(aID, aText);

    //temporarily store the id:text key/value pair in answersDictionary
    //so we can refer to the text by id when building teh summary page
    answersDictionary.set(aID, aText);

    let labels = document.getElementsByTagName('label');
    for( let i = 0; i < labels.length; i++){

      labels[i].classList.add ( "radioLabels");
    }

  }

  // progress indicator

  progress = createP("Question " + count + " of " + maxQuestions);
  progress.id("progress"); //for CSS
  progress.addClass("questionBlock");
  progress.parent(mainDiv);
  //



  //-add the next or finish button
  //-are we at the last question yet?

  if (count >= maxQuestions) { // we're at the last question
    nextButton = createButton("Finish");
    nextButton.id("nextButton");
    nextButton.addClass("disabled");
    nextButton.mousePressed(questionEnd);
  } else {
    nextButton = createButton("Next");
    nextButton.id("nextButton");
    nextButton.addClass("disabled");
    nextButton.mousePressed(nextQuestion);
  }


  nextButton.parent(mainDiv); //parent it to mainDiv

  // (start the timer) - could add a timeout function to prompt in v2.0
  //
  // //end of page building
  // ---------------------------------------------------------------------------
}


function nextQuestion() {

  // (stop the timer) if timeout is added in

  //let answer = radio.value(); //read the answerID of the selected option
  //save the current question, answer values in the clientAnswers array
  saveQuestion(currentQuestion, radio.value(), answersDictionary.get(radio.value()));

  //clear the answersDictionary?

  // answersDictionary.set(int(currentQuestion), int(answer)); //put it in a dict - question/answer (key/value) pair
  //console.log("++++++selected answer is: " + answersDictionary.get(currentQuestion));
  //
  // (check if timeout message has been triggered. If so, clear it)
  mainDiv.remove(); //clear the page
  questionBuild();
  // ---------------------------------------------------------------------------
}


//
function questionEnd() {

  //save the current question, answer values in the clientAnswers array
  saveQuestion(currentQuestion, radio.value(), answersDictionary.get(radio.value()));
  console.log("*** at the end ***");
  console.log("number of saved reponses in clientAnswers is: " + clientAnswers.length);
  console.log(clientAnswers);
  // ---------------------------------------------------------------------------
  // (stop the timer)

  //
  // (check if timeout message has been triggered. If so, clear it)
  mainDiv.remove(); //clear the page
  summaryPage();
  // ---------------------------------------------------------------------------
}


function summaryPage() {
  //---create summary page #1.2.3

  //- build the page elements

  mainDiv = createDiv(); //parent element
    mainDiv.parent("content");
  mainDiv.id("contentBlock");
  mainDiv.addClass("questionBlock");

  // create teh question heading
  questionHead = createElement("h1", "Your summary");
  questionHead.id("questionH1");
  questionHead.parent(mainDiv);

  //create a summary of the answers

  for (let i = 0; i < clientAnswers.length; i++) {
    //let qText = clientAnswers[i].question;

    let qText = questions[int(clientAnswers[i].question)].questionText;



    //let aText = clientAnswers[i].answer;
    let aText = answersDictionary.get(clientAnswers[i].answer);

    let summaryPara = createElement("p", qText + " <span class=\"answer\">" + aText + "</span>");
    summaryPara.id("summaryText" + i); //give it an ID for CSS
    summaryPara.parent(mainDiv); //parent to mainDiv
  }

  //- create the nextButton

  nextButton = createButton("Continue");
  nextButton.id("nextButton");
  nextButton.addClass("defaultButton");
  nextButton.mousePressed(declarePage);
  nextButton.parent(mainDiv);


}

function declarePage() {

  mainDiv.remove();

  mainDiv = createDiv(); //parent element
    mainDiv.parent("content");
  mainDiv.id("contentBlock");
  mainDiv.addClass("questionBlock");

  // create teh question heading
  questionHead = createElement("h1", "Declaration");
  questionHead.id("questionH1");
  questionHead.parent(mainDiv);


  declarePara = createP("I declare that the information I have given via this assessment is correct and complete.<br/>If I give false or incomplete information my benefits may be stopped or reduced. In addition, I may be prosecuted or face a financial penalty.<br/>I also understand that the Department may use the information which it has now or may get in the future to decide my entitlement to future support.<br/>To accept these terms and process your claim, you must submit a voice recording by clicking the button below.");
  declarePara.parent(mainDiv);
  declarePara.addClass("textBlock");


  nextButton = createButton("Accept");
  nextButton.parent(mainDiv);
  nextButton.mousePressed(audioDeclaration); //starts audioDeclaration page on mouseClick
}

function audioDeclaration() {
  mainDiv.remove();

  mainDiv = createDiv(); //parent element
    mainDiv.parent("content");
  mainDiv.id("contentBlock");
  mainDiv.addClass("questionBlock");

  // create teh question heading
  pageHead = createElement("h1", "Voice confirmation");
  pageHead.id("questionH1");
  pageHead.parent(mainDiv);


  instructPara = createP("In order to verify your identity and ensure your online security, we require you to record a voice declaration. Please click the button below to start recording, while you read out the following statement:");
  instructPara.parent(mainDiv);
  instructPara.addClass("textBlock");

  prompt = createElement("h2", "\"I declare that my answers are correct to the best of my knowledge.\"");
  prompt.parent(mainDiv);
  //prompt.addClass("textBlock");


  recButton = createButton("Record");
  recButton.parent(mainDiv);
  recButton.mousePressed(recSound); //record declaration

  caveat = createP("By uploading your voice recording, you give permission for your data to be stored and processed by preferred third-party partners for the purposes of identity verification");
  caveat.addClass("smallPrint");
  caveat.parent(mainDiv);


}


function calculateBenefit() {

  // calculate score
  let sumScores = []; //a temp array to hold each scores
  let total = 0;

  //iterate through the clientAnswers array


  for (let i = 0; i < clientAnswers.length; i++) {
    let answerID = clientAnswers[i].answer; //pull out each answer IDs
    let answerScore = int(scoresTable.getString(answerID, 1)); //look up the cooresponding scores from the scoresTable
    sumScores.push(answerScore); // put separate scores in array for safety
    total += answerScore; // update running score
  }




  //build pageElements

  mainDiv.remove(); // clear old page

  mainDiv = createDiv(); //parent element
    mainDiv.parent("content");
  mainDiv.id("contentBlock");
  mainDiv.addClass("questionBlock");

  // create teh question heading
  pageHead = createElement("h1", "Thank you");
  pageHead.id("questionH1");
  pageHead.parent(mainDiv);

  let refID = "DWP-" + date + "/" + letters[floor(random(0, letters.length))];
  console.log(refID);


  refPara = createP("Your reference is: <span class=\"emphasised\">" + refID + "</span>");
  refPara.parent(mainDiv);
  refPara.addClass("textBlock");

  decision = createP("Scan the QR code below");
  decision.parent(mainDiv);
  decision.addClass("textBlock");

  // for (let i = 0; i < sumScores.length; i++) {
  //   createP(sumScores[i] + "<br/>");
  // }




  // accept or deny?
  if (total >= threshold) {
    //decision.html("Your application for AbleFare has been denied");
    let QR = createElement("img");
    QR.attribute("src", "images/denied.svg");
    QR.parent(mainDiv);
  } else {
    //decision.html("Your application for AbleFare has been approved");
    let QR = createElement("img");
    QR.attribute("src", "images/accepted.svg");
    QR.parent(mainDiv);
  }




}

// display a QR code //there's an accept and deny version
// QR can also be clicked if on desktop


// Nice to have log result to a csv on the server (node.js stuff)


// (start the timer) //timeout sends experience back to intro page


// ---------------------------------------------------------------------------
// add today's date
// agreeCheckbox = createCheckbox(); //add "I agree" checkbox (unchecked)
// agreeCheckbox.changed(validateCheckbox)// if checked (agreed), then let user click "submit"
// submitButton = createButton("Submit");
// submitButton.addClass("disabled");
// submitButton.mousePressed(calculateBenefit);
//
// (start the timer) //timeout sends to "logged out due to inactivity"
//
// ---------------------------------------------------------------------------


//
// //-utility code

function radChoose(){
nextButton.attribute("class","enabled");
}


function generateRandom(num) {
  //- generate random between 0 and number of questions in JSON
  let rnd = int(floor(random(num)));
  return rnd;
}


function saveQuestion(quest, answ, txt) {
  let tempData = {
    "question": quest,
    "answer": int(answ),
    "text": txt
  };

  //console.log("tempdata is: " + tempData);

  clientAnswers.push(tempData);
}

function checkNumber(curr) {
  //-check that this question isn't in the askedQuestions array
  //- i.e. if it isn't then it hasn't been asked yet
  for (let i = 0; i < askedQuestions.length; i++) { //loop through every index of askedQuestions[]}
    if (askedQuestions[i] == curr) { //if currentQuestion is already in the array
      currentQuestion = generateRandom(numQuestions); //generate another random number
      checkNumber(currentQuestion); //recursively run this function to check this new random number
    }
  }
  askedQuestions.push(curr); //if its unique, add it to the array of asked questions
  return;

}

function clearPage() {
  //console.log("hello");
  //clears anything that's been selected to the pageElements "clipboard"

  if (pageElements == "") {
    console.log("Warning: Nothing to clear!");
  }

  //loop through pageElements and clear each thing
  for (let i = 0; i < pageElements.length; i++) {
    pageElements[i].remove();
  }
}



function mousePressed() {
  // console.log("mouse clicked");
}

function recSound() {
  getAudioContext().resume()
  // use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
  if (state === 0 && mic.enabled) {
    // Tell recorder to record to a p5.SoundFile which we will use for playback
    recorder.record(soundFile);

    //background(255, 0, 0);
    //text('Recording now! Click to stop.', 20, 20);

    //change text of button
    recButton.html("Recording •");
    recButton.attribute("class","recording");
    state++;
  } else if (state === 1) {
    recorder.stop(); // stop recorder, and send the result to soundFile

    //background(0, 255, 0);
    recButton.html("Play");
    recButton.attribute("class","playing");
    //text('Recording stopped. Click to play & save', 20, 20);
    state++;
  } else if (state === 2) {
    let soundFilename = date + ".wav";
    soundFile.play(); // play the result!
    // saveSound(soundFile, 'mySound.wav'); // save file
    state++;
    soundBlob = soundFile.getBlob(); //get the recorded soundFile's blob & store it in a variable

    let formdata = new FormData() ; //create a from to of data to upload to the server
    formdata.append('soundBlob', soundBlob,  soundFilename) ; // 'myfiletosave.wav' append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

        // Now we can send the blob to a server...
    var serverUrl = '/upload'; //we've made a POST endpoint on the server at /upload
    //build a HTTP POST request
    var httpRequestOptions = {
      method: 'POST',
      body: formdata , // with our form data packaged above
      headers: new Headers({
        'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
      })
    };
    console.log(httpRequestOptions);
    // use p5 to make the POST request at our URL and with our options
    httpDo(
      serverUrl,
      httpRequestOptions,
      (successStatusCode)=>{ //if we were successful...
        console.log("uploaded recording successfully: " + successStatusCode)
      },
      (error)=>{console.error(error);}
    )
    console.log('recording stopped');

state = 0;

// addfilename of .wav to the json file to retrieve from other pageElements

//--emit() testing stuff...remove?
// let info = "hello there";
// socket.emit("logFileName", info);


recButton.html("Finish");
recButton.attribute("class","enabled");
recButton.mousePressed(calculateBenefit); //calculate on mouseClick
  }
}
