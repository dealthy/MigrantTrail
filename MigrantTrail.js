//global UI variables
var globalCanvas;
var globalButton1;
var globalButton2;
var globalButton3;
var globalButton4;
var globalTextEntry;

//global game variables
var globalStoryState;
var globalPlayerName;
var globalPlayerProfession;

//debug variables
//NOTE: ALL GLOBAL VARIABLES MUST START WITH "global" OR THE WILL NOT BE EDITABLE BY THE DEBUG TEXT INPUT FEATURE
var globalDebugTextInput;
var globalDebugSendCommand;
var globalDebugTextOutput;


//bind the user interface elements to global variables and start a new game
function initializeGame(canvas, button1, button2, button3, button4, textEntry, story) {
    globalCanvas = canvas;
    globalButton1 = button1;
    globalButton2 = button2;
    globalButton3 = button3;
    globalButton4 = button4;
    globalTextEntry = textEntry;

    //story needs to be imported everywhere when it is used
    //it is from the moudule file that calls the function
    console.log(story.Intro);
    newGame(story);

}

//link to the debug UI controls
function initializeDebug(debugTextInput, debugSendCommand, debugTextOutput) {
        
    globalDebugTextInput = debugTextInput;
    globalDebugSendCommand = debugSendCommand;
    globalDebugTextOutput = debugTextOutput;

    debugLog("Debug Log:");
}

//parse the text in the debug text input box to assign global variable values and/or trigger game states
//One variable assign per line. Assigning globalStoryState also triggers a reset of the story state
//
// for example:
//  globalPlayerName = "David"
//  globalStoryState = "EnterName"
// would set the two global variables and reset the story state by calling advanceStory();
function debugSendCommand() {
    var cmd = globalDebugTextInput.value;
    var setStoryState = false;
    do {
        //split the debug text into single lines
        var indexOfNewLine = cmd.indexOf("\n");
        //include the last line without a newline character
        if (indexOfNewLine < 0) {indexOfNewLine = cmd.length;} 
        var line = cmd.substr(0, indexOfNewLine);
        //check to see if the line follows the format "variable = value"
        if (line.includes("=")) {
            //pull the variable name and value
            var variable = line.substr(0, line.indexOf("="));
            //do not allow any non-alphanumeric characters in the variable name;
            variable = variable.replace(/\W|_/g, "");            
            var value = line.substr(line.indexOf("=")+1, line.length);
            value = value.trim();
            //only allow editing of variables that are global and start with the keyword "global"
            if (variable.substring(0, 6) == "global") {
                try {
                    //set variable = value
                    eval(variable + " = " + value);
                    //if the variable was globalStoryState, also flag a reset of the story later
                    if (variable == "globalStoryState") {setStoryState = true;}
                    debugLog("Set " + variable + " to " + value);
                }
                catch (e){
                    debugLog("Failed to evaluate: " + variable + " = " + value + "\nIs " + variable + " a global variable?");
                    debugLog(e);
                }
            }
        }
        cmd = cmd.substr(indexOfNewLine + 1, cmd.length);
    } while (cmd.length > 0);
    
    //if globalStoryState was changed, reset the story
    if (setStoryState){
        advanceStory(story);
    }
}

//add "text" to the debugTextOutput box
function debugLog(text) {
    globalDebugTextOutput.value = globalDebugTextOutput.value + "\n" + text;
}

//reset the UI elements and reset the story
function newGame(story) {
    
    closeUI();
    console.log(story.Intro);
    globalStoryState = "Intro";
    advanceStory(story);
}

//draw an image in the upper two thirds of the canvas.
//the image name is passed as a parameter and must be type
//png and have size 800 x 300 pixels
function drawImage(story, storyStage)
{
    try {
        var base_image = new Image();
        var imageName = eval("story." + storyStage + ".image")
        base_image.src = "img/" + imageName + ".png";
        base_image.onload = function(){
            var ctx = globalCanvas.getContext("2d");
          ctx.drawImage(base_image, 0, 0);
        }
    }
    catch (e) {
        debugLog("Failed to load : img/" + imageName + ".png does it exist?");
        debugLog(e);
    }
}

//draw a text box in the lower thrid of the canvas
//pass the text to draw as a parameter and then parse that
//test into lines
function drawText(text) {
    var ctx = globalCanvas.getContext("2d");
    //fill the space with a white rectangle to overwrite previous text
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,300,800,500);
    //draw two black border rectangles
    ctx.rect(0,300,800,500);
    ctx.stroke();
    ctx.rect(5,305,790,190);
    ctx.stroke();
    
    //set the text font
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";

    //all text must terminate in a space character
    text = text + " ";
    //print five lines
    for (var i = 0; i <= 5; i++) {
        //create a variable for each line
        var textLine = "";
        //fill that line with words until it reaches full length or all the text is used
        while (textLine.length < 85 && text.length > 1) {
            //find the next word
            var indexOfSpace = text.indexOf(" ");
            if (indexOfSpace >= 0) {
                //get the next word
                var nextWord = text.substr(0, indexOfSpace) + " ";
                //if the next word would not cause overflow to the next line, append it
                if (textLine.length + nextWord.length < 85) {
                    textLine = textLine + nextWord;
                    text = text.substr(indexOfSpace + 1, text.length);
                }
                //otherwise, skip the next word for now, it will go on the next line
                else {
                    break;
                }
            }
        }
        //var textLine = text.substr(0, 40);
        //text = text.substr(40, text.length);
        ctx.fillText(textLine,30,335+30*i);
    }
    //if there is still text left, prompt a continue
    debugLog(text);
}

//make the text box visible. optional parameter to enter
//default text into the textbox
function acceptText(text) {
    if (typeof text === 'undefined') { text = ""; }
    
    globalTextEntry.style.display = "initial";
    globalTextEntry.value = text;
}

//make button number buttonNumvber visible. 
//parameter text will change the text of the button
function setButton(buttonNumber, text) {
    if (buttonNumber == 1) {
        globalButton1.style.display = "initial";
        globalButton1.value = text;
    }
    else if (buttonNumber == 2) {
        globalButton2.style.display = "initial";
        globalButton2.value = text;
    }
    else if (buttonNumber == 3) {
        globalButton3.style.display = "initial";
        globalButton3.value = text;
    }
    else if (buttonNumber == 4) {
        globalButton4.style.display = "initial";
        globalButton4.value = text;
    }
}

//fires when one of the User Interface buttons is clicked
//pass the button number that was clicked to the story
//and reset the UI
function captureButton(story, buttonNumber) {
    closeUI();
    advanceStory(story, buttonNumber);
}

//reset the UI. Make all UI elements disabled
function closeUI() {
    globalButton1.style.display = "none";
    globalButton2.style.display = "none";
    globalButton3.style.display = "none";
    globalButton4.style.display = "none";
    globalTextEntry.style.display = "none";
}


//this function aims to change out all the user end info (eg. names) from the text in the story

function replaceWord(searchedWord, objectToSearch, changeTo) {
    var indexNum;
    while(true) {
        indexNum = objectToSearch.search(searchedWord);
        if (indexNum == -1) {
            break;
        } else {
            objectToSearch = objectToSearch.slice(0, indexNum) + changeTo + objectToSearch.slice(indexNum + searchedWord.length, objectToSearch.length);
        }
    }
    return objectToSearch;
}


function textProcessing(objectToSearch, searchedWords) {
    story.CommonInfo.forEach(replaceWord(item, objectToSearch, ))
}



//the game story
//
//optional parameter buttonNumber is the UI button that was clicked
//
//global variable globalStoryState keeps track of which step in the story the user has reached
//in each story stage, the image and/or text have to be reset with drawImage and drawText
//additionally, the UI needs to be set up as it closes after every user input.


function advanceStory(story, buttonNumber) {
    console.log(story.Intro)
    var processedTest;
    //the buttonNumber variable is an optional parameter, so set it to zero if it is unused
    if (typeof buttonNumber === 'undefined') { buttonNumber = 0; }
    
    //possibly have searchig function here to find the story in the storyline file instead
    //of using if statements as the story will get longer
    if (globalStoryState == "Intro") {
        drawImage(story, globalStoryState);
        drawText(story.Intro.text);

        acceptText();
        setButton(1, story.Intro.button);
        globalStoryState = "EnterName";
    }
    else if (globalStoryState == "EnterName") {
        if (globalTextEntry.value.length > 0) {
            globalPlayerName = globalTextEntry.value;
            story.CommonInfo.xyz = globalPlayerName;
            
            drawImage(story, globalStoryState);
            drawText(story.EnterName.text);

            setButton(1, story.EnterName.buttonOne);
            setButton(2, story.EnterName.buttonTwo);
            setButton(3, story.EnterName.buttonThree);
            setButton(4, story.EnterName.buttonFour);
            
            globalStoryState = "ChooseProfession";
        }
        else {
            drawText("Enter a name in the box below. Your name must be at least one character long.");
            acceptText();
            setButton(1, "Enter your name");
            globalStoryState = "EnterName";
        }
        
    }
    else if (globalStoryState == "ChooseProfession") {
        if (buttonNumber == 1) {
            drawText("You've heard stories of how dangerous the migrant trail can be. You gather your small medical kit ominously expecting it to be useful.");
            globalPlayerProfession = "MedStudent";
        }
        else if (buttonNumber == 2) {
            drawText("When times were tough you would call on your extensive contacts network for work wherever it could be found. You couldn't imagine leaving without it and tuck it into your pocket.");
            globalPlayerProfession = "OddJobs";
        }
        else if (buttonNumber == 3) {
            drawText("You had always enjoyed chatting with guests at the hotel; especially the foreigners. Over time you developed up a functional vocabulary in several languages. You don't know where your journey will take you but you expect to need to ask for some help along the way.");
            globalPlayerProfession = "HotelClerk";
        }
        else if (buttonNumber == 4) {
            drawText("Even if you owned a car, you couldn't drive it out of the city unnoticed. You take a small toolkit with you anyway. Fortune favors the well prepared, you figure.");
            globalPlayerProfession = "Mechanic";
        }
        globalStoryState = "ChoosePersonalItem";
    }
    else if (globalStoryState == "ChoosePersonalItem") {
        //TODO
    }
    else {
        //entered an invalid story state
        debugLog("Story State Not Found: " + globalStoryState);
    }
}
