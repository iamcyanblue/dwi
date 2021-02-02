let stories;
let name
let town;
let story;
let age;

function preload(){
  stories = loadJSON("stories.json");
}


function setup() {
  noCanvas();
  //choose a random index from array of stories
  let rnd = floor(random(0, stories.people.length));
  // pull out the fields
  name = stories.people[rnd].name;
  age = stories.people[rnd].age;
  town = stories.people[rnd].location;
  story = stories.people[rnd].story;

  let content = createDiv();
  content.addClass("content");
  content.parent("main");

  let heading = createElement("h1", "Your profile");
  heading.parent(content);

  let preamble = createP("The following story is based on research and qualitative data&#42; gathered by <span class = \"emphasis\">Disabled People Against Cuts \(DPAC\)</span>, in which ill and disabled people related the difficulties they've experienced whilst applying for <span class = \"emphasis\">Personal Independence Payments \(PIP\)</span>.<br/><span class = \"caveat\">&#42;Please note that names have been changed.</span>");
  preamble.parent(content)

  let boxOut = createDiv();
  boxOut.addClass("boxOut");
  boxOut.parent(content);

  //build the subtitle string with formatting
  let subtitleDetails = name + ", " + age + " – <span class=\"town\">" + town + "</span>";

  let subtitle = createElement("h2", subtitleDetails);
  subtitle.parent(boxOut);

  let bio = createP(story);
  bio.parent(boxOut);

  let intro = createElement("h3","Click the button below to take the assessment as " + name);
  intro.parent(content);

  let link = createElement("a");
  link.attribute("href", "client.html");
  link.attribute("target", "_self");
  link.id("next");
  link.parent(content);

  let button = createButton("Start");
  button.addClass("button");
  button.parent("next");


}

function startPage() {
}
