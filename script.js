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
let touchedKeys = [];
let currentOctave = 3;
let instrument = Synth.createInstrument("piano");
addEventListener("load", () => {
    drawKeys();
    drawInfo();
    volumeRange.addEventListener("change", () => Synth.setVolume(volumeRange.value))
    instrumentSelectList.addEventListener("change", () => instrument = Synth.createInstrument(instrumentSelectList.value))
    addEventListener("keydown", (event) => {
        if (!keyboardNotes.hasOwnProperty(event.keyCode)) return
        if (touchedKeys.findIndex(e => e == event.keyCode) != -1) return;
        let pressedkey = keyboardNotes[event.keyCode].split(",");
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
        touchedKeys.push(event.keyCode)
        pianoEvent(event, "+", "keydown")
    })
    addEventListener("keyup", (event) => {
        if (!keyboardNotes.hasOwnProperty(event.keyCode)) return
        touchedKeys.splice(touchedKeys.findIndex(e => e = event.keyCode), 1)
        pianoEvent(event, "-", "keyup")
    })
})
function drawKeys() {
    let iWhite = 0;
    var whiteWidth = 4.5;
    for (var i = 0; i <= 2; i++) {
        for (var note in new AudioSynth()._notes) {
            var thisKey = document.createElement('div');
            if (note.length > 1) {
                thisKey.className = 'black key d-flex flex-column align-items-center';
                thisKey.style.width = (whiteWidth / 1.8) + 'rem';
                thisKey.style.height = (whiteWidth * 2) + 'rem';
                thisKey.style.left = (whiteWidth * (iWhite - 1)) + (whiteWidth * 0.75) + 'rem';
            } else {
                thisKey.className = 'white key d-flex flex-column align-items-center';
                thisKey.style.width = whiteWidth + 'rem';
                thisKey.style.height = (whiteWidth * 4) + 'rem';
                thisKey.style.left = whiteWidth * iWhite + 'rem';
                iWhite++;
            }
            thisKey.id = `${note}${i + 1}`;
            keyboardDiv.appendChild(thisKey);
        }
    }
}
function drawInfo() {
    for (var key in keyboardNotes) {
        let parentDiv = document.getElementById(keyboardNotes[key].replace(",", ""))

        // Keyboard Buttons
        let span1 = document.createElement("span");
        span1.innerHTML = keyboardMapping[key];
        span1.className = keyboardNotes[key].includes("#") ? "blackKeyboard" : "whiteKeyboard"

        // Key Note
        let span2 = document.createElement("span");
        let pressedkey = keyboardNotes[key].split(",")
        switch (pressedkey[1]) {
            case "1": {
                span2.innerHTML = pressedkey[0] + currentOctave;
                break;
            }
            case "2": {
                span2.innerHTML = pressedkey[0] + (currentOctave + 1);
                break;
            }
            case "3": {
                span2.innerHTML = pressedkey[0] + (currentOctave + 2);
                break;
            }
        }
        span2.className = keyboardNotes[key].includes("#") ? "blackNote" : "whiteNote"

        parentDiv.appendChild(span1);
        parentDiv.appendChild(span2);
    }
}
function octaveChange() {
    if (+octaveInput.value < 1 || +octaveInput.value > 6)
        octaveInput.value = octaveInput.value < 1 ? 1 : 6;
    currentOctave = +octaveInput.value
    for (var key in keyboardNotes) {
        let parentDiv = document.getElementById(keyboardNotes[key].replace(",", ""))
        let span = parentDiv.children[1];
        let pressedkey = keyboardNotes[key].split(",")
        switch (pressedkey[1]) {
            case "1": {
                span.innerHTML = pressedkey[0] + eval(currentOctave);
                break;
            }
            case "2": {
                span.innerHTML = pressedkey[0] + eval(currentOctave + 1);
                break;
            }
            case "3": {
                span.innerHTML = pressedkey[0] + eval(currentOctave + 2);
                break;
            }
        }
    }
}
function pianoEvent(event, sign, currentEvent) {
    let keyDiv = document.getElementById(keyboardNotes[event.keyCode].replace(",", ""))
    switch (currentEvent) {
        case "keyup": {
            keyDiv.style.background = keyDiv.id.includes("#") ? "rgb(32, 32, 32)" : "#ffffff"
            break;
        }
        case "keydown": {
            keyDiv.style.background = keyDiv.id.includes("#") ? "rgb(120, 120, 120)" : "rgb(215, 214, 214)"
            break;
        }
    }
    keyDiv.style.marginTop = +keyDiv.style.marginTop.split("px")[0] + eval(sign + 5) + "px";
}
function toggleInfo(child) {
    const pianoKeysDiv = document.getElementsByClassName("key");
    for (let i = 0; i < pianoKeysDiv.length; i++)
        pianoKeysDiv[i].children[child].classList.toggle('opacity-0');
}






