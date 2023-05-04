let socket = io("http://localhost:3000",{autoConnect: false});
const keyboardNotes = {

    /* 2 */
    50: 'C#,1',

    /* 3 */
    51: 'D#,1',

    /* 5 */
    53: 'F#,1',

    /* 6 */
    54: 'G#,1',

    /* 7 */
    55: 'A#,1',

    // --------------------- //

    /* 9 */
    57: 'C#,2',

    /* 0 */
    48: 'D#,2',

    /* = */
    187: 'F#,2',

    /* Backspace */
    8: 'G#,2',

    // --------------------- //

    /* Q */
    81: 'C,1',

    /* W */
    87: 'D,1',

    /* E */
    69: 'E,1',

    /* R */
    82: 'F,1',

    /* T */
    84: 'G,1',

    /* Y */
    89: 'A,1',

    /* U */
    85: 'B,1',

    // --------------------- //

    /* I */
    73: 'C,2',

    /* O */
    79: 'D,2',

    /* P */
    80: 'E,2',

    /* [ */
    219: 'F,2',

    /* ] */
    221: 'G,2',

    // --------------------- //

    /* S */
    83: 'A#,2',

    /* F */
    70: 'C#,3',

    /* G */
    71: 'D#,3',

    /* J */
    74: 'F#,3',

    /* K */
    75: 'G#,3',

    /* L */
    76: 'A#,3',

    // --------------------- //

    /* Z */
    90: 'A,2',

    /* X */
    88: 'B,2',

    /* C */
    67: 'C,3',

    /* V */
    86: 'D,3',

    /* B */
    66: 'E,3',

    /* N */
    78: 'F,3',

    /* M */
    77: 'G,3',

    /* , */
    188: 'A,3',

    /* . */
    190: 'B,3',

};
const keyboardMapping = {
    "8": "<-",
    "48": "0",
    "50": "@",
    "51": "#",
    "53": "%",
    "54": "^",
    "55": "&",
    "57": "(",
    "66": "B",
    "67": "C",
    "69": "E",
    "70": "F",
    "71": "G",
    "73": "I",
    "74": "J",
    "75": "K",
    "76": "L",
    "77": "M",
    "78": "N",
    "79": "O",
    "80": "P",
    "81": "Q",
    "82": "R",
    "83": "S",
    "84": "T",
    "85": "U",
    "86": "V",
    "87": "W",
    "88": "X",
    "89": "Y",
    "90": "Z",
    "187": "+",
    "188": "<",
    "190": ">",
    "219": "{",
    "221": "}"
}
let currentOctave = 3;
let instrument = Synth.createInstrument("piano");
let multiplayerFlag = false;

// buttons event listners
addEventListener("load", () => {
    singleplayer.addEventListener("click", () => {
        socket.disconnect();
        loadingDiv.classList.add("opacity-0");
        showHide(pianoDisplay, Home)
        startPiano()
    })
    multiplayer.addEventListener("click", () =>{
        socket.connect();
        loadingDiv.classList.remove("opacity-0")
        socket.on("connect",()=>{
            loadingDiv.classList.add("opacity-0")
            showHide(multiplayerSection, Home)
        });
        socket.on("connect_error",()=>{
            loadingDiv.classList.add("opacity-0")
            showToast(0,"Connection Issue","Failed to connect to server")
            socket.disconnect();    
        }); 
    })
    joinButton.addEventListener("click", () => {
        if (validateRoomInput()) {
            roomIdWarning.classList.add("d-none");
            socket.emit("checkRoomExistance", roomId.value.trim());
        }
        else
            roomIdWarning.classList.add("d-none");
    });
    homeButton.addEventListener("click", () => {
        chatDiv.classList.add("d-none");
        resetPage();
        showHide(Home,pianoDisplay)
    });
    backButton.addEventListener("click", () => {
        roomId.value = "";
        showHide(Home, multiplayerSection);
    });
    createButton.addEventListener("click", () => {
        // localStorage.setItem("nickname", Nickname.value.trim())
        localStorage.setItem("roomId", socket.id)
        showHide(pianoDisplay, multiplayerSection)
        chatDiv.classList.remove("d-none");
        roomIdDiv.innerText = `<div class="text-center"><span class="text-center">You hosted room: ${socket.id}</span><button onclick="copyRoomId()" class="mx-2 py-0 px-1 btn btn-primary shadow-none">Copy</button></div>`
        startPiano()
        multiplayerFlag = true;
    })
})

// socket.io event listners
socket.on("RoomResult", (result) => {
    if (result) {
        localStorage.setItem("roomId", roomId.value.trim())
        socket.emit("joinMe", roomId.value.trim(), sessionStorage.getItem("nickname"));
        startPiano();
        roomIdDiv.innerText = `<div class="text-center"><span class="text-center">You joined room: ${roomId.value.trim()}</span><button onclick="copyRoomId()" class="mx-2 py-0 px-1 btn btn-primary shadow-none">Copy</button></div>`
        multiplayerFlag = true;
        chatDiv.classList.add("d-none");
        restrictConfigurations();
        showHide(pianoDisplay, multiplayerSection);
    } else
        roomIdWarning.classList.remove("d-none");
});
socket.on('connection-success', success => {
    alert('Connection');
})
socket.on("keyDownTrigger", (keyCode) => playNote(keyCode,true))
socket.on("keyUpTrigger", (keyCode) => releaseNote(keyCode,true))
socket.on("octaveChangeTrigger", (newValue) => {
    octaveChange(newValue);
    octaveInput.value = newValue
})
socket.on("instrumentChangeTrigger", (newValue) => {
    instrumentChange(newValue);
    instrumentSelectList.value = newValue;
})

// utilites functions
function playNoteOnKeyDown(event) {
    playNote(event.keyCode);
}
function releaseNoteOnKeyUp(event) {
    releaseNote(event.keyCode);
}
function startPiano() { 
    drawKeys();
    drawInfo();
    addEventListener("keydown", playNoteOnKeyDown)
    addEventListener("keyup", releaseNoteOnKeyUp)
}
function resetPage(){
    keyboardDiv.innerText="";
    removeEventListener("keydown", playNoteOnKeyDown)
    removeEventListener("keyup", releaseNoteOnKeyUp)
}
function playNote(keyCode,remoteNote=false) {
    if (!keyboardNotes.hasOwnProperty(keyCode)) return
    let pressedKeyDiv=document.getElementById(keyboardNotes[keyCode].replace(",", ""))
    if (pressedKeyDiv.classList.contains("pressed")) return
    let pressedkey = keyboardNotes[keyCode].split(",");
    let pressedOctave;
    switch (pressedkey[1]) {
        case "1": {
            pressedOctave = currentOctave
            break;
        }
        case "2": {
            pressedOctave = currentOctave + 1
            break;
        }
        case "3": {
            pressedOctave = currentOctave + 2
            break;
        }
    }
    instrument.play(pressedkey[0], pressedOctave, 2);
    pianoEvent(keyCode,remoteNote)
    if (multiplayerFlag) socket.emit("keyDownRemote", keyCode, localStorage.getItem("roomId"))
}
function releaseNote(keyCode,remoteNote=false) {
    if (!keyboardNotes.hasOwnProperty(keyCode)) return
    let pressedKeyDiv=document.getElementById(keyboardNotes[keyCode].replace(",", ""))
    if (!pressedKeyDiv.classList.contains("pressed")) return
    pianoEvent(keyCode,remoteNote)
    if (multiplayerFlag) socket.emit("keyUpRemote", keyCode, localStorage.getItem("roomId"))
} 
function drawKeys() {
    let iWhite = 0;
    const whiteWidth = 4.5;
    for (var i = 0; i <= 2; i++) {
        for (var note in new AudioSynth()._notes) {
            var thisKey = document.createElement('div');
            if (note.length > 1) {
                thisKey.className = 'black key d-flex flex-column align-items-center';
                thisKey.style.width = (whiteWidth / 1.6) + 'rem';
                thisKey.style.height = (whiteWidth * 2) + 'rem';
                thisKey.id = `${note}${i + 1}`;
            } else {
                thisKey.className = 'white key d-flex flex-column align-items-center';
                thisKey.style.width = whiteWidth + 'rem';
                thisKey.style.height = (whiteWidth * 4) + 'rem';
                thisKey.id = `${note}${i + 1}`;
                iWhite++;
            }
            keyboardDiv.appendChild(thisKey);
        }
    }
}
function drawInfo() {
    for (var key in keyboardNotes) {
        let parentDiv = document.getElementById(keyboardNotes[key].replace(",", ""))

        // Keyboard Buttons
        let span1 = document.createElement("span");
        span1.innerText = keyboardMapping[key];
        span1.className = keyboardNotes[key].includes("#") ? "blackKeyboard keyboardStyleButton" : "whiteKeyboard keyboardStyleButton"

        // Key Note
        let span2 = document.createElement("span");
        let pressedkey = keyboardNotes[key].split(",")
        switch (pressedkey[1]) {
            case "1": {
                span2.innerText = pressedkey[0] + currentOctave;
                break;
            }
            case "2": {
                span2.innerText = pressedkey[0] + (currentOctave + 1);
                break;
            }
            case "3": {
                span2.innerText = pressedkey[0] + (currentOctave + 2);
                break;
            }
        }
        span2.className = keyboardNotes[key].includes("#") ? "blackNote" : "whiteNote"

        parentDiv.appendChild(span1);
        parentDiv.appendChild(span2);
    }
}
function octaveChange(newValue) {
    if(currentOctave== +newValue)return 
    if (+newValue < 1 || +newValue > 6)
        newValue = newValue < 1 ? 1 : 6;
    currentOctave = +newValue
    for (var key in keyboardNotes) {
        let parentDiv = document.getElementById(keyboardNotes[key].replace(",", ""))
        let span = parentDiv.children[1];
        let pressedkey = keyboardNotes[key].split(",")
        switch (pressedkey[1]) {
            case "1": {
                span.innerText = pressedkey[0] + eval(currentOctave);
                break;
            }
            case "2": {
                span.innerText = pressedkey[0] + eval(currentOctave + 1);
                break;
            }
            case "3": {
                span.innerText = pressedkey[0] + eval(currentOctave + 2);
                break;
            }
        }
    }
    socket.emit("octaveChange", currentOctave, localStorage.getItem("roomId"))
}
function pianoEvent(keyCode,remoteNote) {
    let keyDiv = document.getElementById(keyboardNotes[keyCode].replace(",", ""))
    keyDiv.classList.toggle("pressed")
    if(remoteNote) keyDiv.classList.toggle("secondPlayer")
    else keyDiv.classList.toggle("mainPlayer")
}
function toggleInfo(child) {
    const pianoKeysDiv = document.getElementsByClassName("key");
    for (let i = 0; i < pianoKeysDiv.length; i++)
        pianoKeysDiv[i].children[child].classList.toggle('opacity-0');
}
function showHide(show, hide) {
    show.classList.remove("d-none");
    hide.classList.add("d-none");
}
function validateRoomInput() {
    roomWarning.classList.add("d-none");
    if (!roomId.value.trim().length) {
        roomWarning.classList.remove("d-none");
        return 0;
    }
    return 1;
}
function copyRoomId() {
    navigator.clipboard.writeText(roomId.value.trim() || socket.id);
}
function instrumentChange(newInstrument) {
    if (instrument.name == newInstrument) return
    instrument = Synth.createInstrument(newInstrument)
    if (multiplayerFlag)
        socket.emit("instrumentChange", newInstrument, localStorage.getItem("roomId"));
}
function volumeChange(newVolume) {
    Synth.setVolume(newVolume)
} 
function restrictConfigurations(){
    instrumentSelectList.disabled=true;
    octaveInput.disabled=true;
}
function showToast(status,header,body){
    if(status) {
        successToastBody.innerText=body;
        successToastHeader.innerText=header
    }
    else {
        errorToastBody.innerText=body;
        errorToastHeader.innerText=header
    } 
    const toast = (status)? bootstrap.Toast.getOrCreateInstance(successToastDiv):bootstrap.Toast.getOrCreateInstance(errorToastDiv)
    toast.show();
}
function toggleChatWindow(){
    chatWindow.classList.toggle('d-none');
    if(chatWindow.classList.contains("d-none"))
    {
        if(+notificationCount.innerText>0) 
            notificationCount.classList.remove("d-none")
        else 
            notificationCount.classList.add("d-none")
    }
}
