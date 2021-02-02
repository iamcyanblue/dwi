let trainingSet;
let graphYBaseline = 350;
let graphXorigin = 50;
let graphScale = 30;
let canvas;
let whichGraph = 0 ;
let colors = [[0, 102, 204, 200], [0, 153, 0, 200], [204, 0, 0, 200], [255, 153, 0, 200]];

function preload() {
  trainingSet = loadJSON("trustModel.json");
}

function setup() {
  canvas = createCanvas(400, 400);
  canvas.addClass("graph");
  canvas.parent("graph");
  canvas.mouseClicked(incrementGraph);
  //   console.log(trainingSet.dataset[0].confidence);
  //   //console.log("========================");
  //   console.log(trainingSet.dataset.length);

  //   console.log(trainingSet.dataset[1].confidence);

  //   console.log(trainingSet.trust0.volume);

  //   for (i in trainingSet.trust0.volume){
  //     console.log(trainingSet.trust0.volume[i]);
  //   }

}

function draw() {
  //background(255);
  clear();
  DrawGraph(whichGraph);
}


function incrementGraph(){
  //console.log("clicked!" + whichGraph);
  whichGraph ++;
  whichGraph = whichGraph % 4;
  //increment and wrap around the index
}


function DrawGraph(number) { //x, y, label, colour, data

  //draw grid
  stroke(100);
  line(graphXorigin, graphYBaseline, graphScale * 11, graphYBaseline); //draw x axis

  line(graphXorigin, graphYBaseline, graphXorigin, graphYBaseline - (graphScale * 10)); //draw y axis

  //draw linear progression
  stroke(colors[number]);
  line(graphXorigin, graphYBaseline, graphScale * 11, graphYBaseline - (graphScale * 10));

  //draw preferred area
  fill(225, 50);
  noStroke();

  rect(graphXorigin + (graphScale * 5.35), graphYBaseline - (graphScale * 10), graphScale * 4, graphScale * 10);





  if (number == 0) { // draw volume graph

    fill(0);
    noStroke();
    textAlign(CENTER);
    let centre = graphXorigin + ((graphScale * 10) / 2);
    text("TRUSTWORTHINESS", centre, graphYBaseline + 20);

    push();
    translate(graphXorigin / 2, graphYBaseline / 2);
    rotate(PI / -2.0);
    text("VOLUME", 0, 0);
    pop();



    //draw graph data

    fill(colors[number]);
    for (var i = 0; i < trainingSet.dataset.length; i++) {
      let temp = trainingSet.dataset[i].volume;
      //console.log(temp);

      for (j in temp) {
        //console.log(temp[j]);
        ellipse((i * graphScale) + graphXorigin, graphYBaseline - (temp[j] * graphScale), 10, 10);
      }

    }



  } else if (number == 1) { //draw speed graph
    console.log("Draw speed graph");
    fill(0);
    noStroke();

    textAlign(CENTER);
    let centre = graphXorigin + ((graphScale * 10) / 2);
    text("TRUSTWORTHINESS", centre, graphYBaseline + 20);

    push();
    translate(graphXorigin / 2, graphYBaseline / 2);
    rotate(PI / -2.0);
    text("SPEED", 0, 0);
    pop();



    //draw graph data

    fill(colors[number]);
    for (var i = 0; i < trainingSet.dataset.length; i++) {
      let temp = trainingSet.dataset[i].speed;
      //console.log(temp);

      for (j in temp) {
        //console.log(temp[j]);
        ellipse((i * graphScale) + graphXorigin, graphYBaseline - (temp[j] * graphScale), 10, 10);
      }

    }

  } else if (number == 2) { //draw confidence graph
    console.log("Draw confidence graph");
    fill(0);
    noStroke();
    textAlign(CENTER);
    let centre = graphXorigin + ((graphScale * 10) / 2);
    text("TRUSTWORTHINESS", centre, graphYBaseline + 20);

    push();
    translate(graphXorigin / 2, graphYBaseline / 2);
    rotate(PI / -2.0);
    text("CONFIDENCE", 0, 0);
    pop();



    //draw graph data
    noStroke();
    fill(colors[number]);
    for (var i = 0; i < trainingSet.dataset.length; i++) {
      let temp = trainingSet.dataset[i].confidence;
      //console.log(temp);

      for (j in temp) {
        //console.log(temp[j]);
        ellipse((i * graphScale) + graphXorigin, graphYBaseline - (temp[j] * graphScale), 10, 10);
      }

    }


  } else if (number == 3) { //draw hesitation graph

    fill(0);
    noStroke();
    textAlign(CENTER);
    let centre = graphXorigin + ((graphScale * 10) / 2);
    text("TRUSTWORTHINESS", centre, graphYBaseline + 20);

    push();
    translate(graphXorigin / 2, graphYBaseline / 2);
    rotate(PI / -2.0);
    text("HESITATION", 0, 0);
    pop();



    //draw graph data
    noStroke();
    fill(colors[number]);
    for (var i = 0; i < trainingSet.dataset.length; i++) {
      let temp = trainingSet.dataset[i].hesitation;
      //console.log(temp);

      for (j in temp) {
        //console.log(temp[j]);
        ellipse((i * graphScale) + graphXorigin, graphYBaseline - (temp[j] * graphScale), 10, 10);
      }

    }

  }

}
