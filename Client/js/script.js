let socket = io(`http://${serverIp}:${serverport}`, { autoConnect: false });
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
        Title.classList.add("d-none");
        socket.disconnect();
        loadingDiv.classList.add("opacity-0");
        showHide(pianoDisplay, Home)
        startPiano()
    })
    multiplayer.addEventListener("click", () => {
        socket.connect();
        loadingDiv.classList.remove("opacity-0")
        socket.on("connect", () => {
            loadingDiv.classList.add("opacity-0")
            showHide(multiplayerSection, Home)
            Title.classList.add("d-none");
        });
        socket.on("connect_error", () => {
            loadingDiv.classList.add("opacity-0")
            showToast(0, "Connection Issue", "Failed to connect to server")
            socket.disconnect();
        });
    })
    joinButton.addEventListener("click", () => {
        if (validateRoomInput()) {
            socket.emit("checkRoomExistance", roomId.value.trim());
        }
        else
        showToast(0, "Invalid room input", "Please check your room id again")
    });
    homeButton.addEventListener("click", () => {
        if (socket.connected) socket.disconnect();
        Title.classList.remove("d-none");
        resetPage();
        showHide(Home, pianoDisplay)
    });
    backButton.addEventListener("click", () => {
        if (socket.connected) socket.disconnect();
        roomId.value = "";
        Title.classList.remove("d-none");
        showHide(Home, multiplayerSection);
    });
    createButton.addEventListener("click", () => {
        sessionStorage.setItem("roomId", socket.id)
        showHide(pianoDisplay, multiplayerSection)
        showToast(1, "Room created", "You've hosted room "+socket.id)
        roomIdDiv.innerHTML = `<div class="text-center"><span class="text-center">You hosted room: ${socket.id}</span><button onclick="copyRoomId()" class="mx-2 py-0 px-1 btn btn-primary shadow-none">Copy</button></div>`
        startPiano()
        multiplayerFlag = true;
    })
})

// socket.io event listners
socket.on("RoomResult", (result) => {
    if (result) {
        sessionStorage.setItem("roomId", roomId.value.trim())
        startPiano();
        roomIdDiv.innerHTML = `<div class="text-center"><span class="text-center">You joined room: ${roomId.value.trim()}</span><button onclick="copyRoomId()" class="mx-2 py-0 px-1 btn btn-primary shadow-none">Copy</button></div>`
        multiplayerFlag = true;
        showToast(1, "Connected successfully", "You've successfully connected to "+roomId.value.trim())
        restrictConfigurations();
        showHide(pianoDisplay, multiplayerSection);
    } else
        showToast(0, "Room not found", "Room doesn't exist. Please check room id again")
});
socket.on('connection-success', success => {
    alert('Connection');
})
socket.on("keyDownTrigger", (keyCode) => playNote(keyCode, true))
socket.on("keyUpTrigger", (keyCode) => releaseNote(keyCode, true))
socket.on("octaveChangeTrigger", (newValue) => {
    octaveChange(newValue);
    octaveInput.value = newValue
})
socket.on("instrumentChangeTrigger", (newValue) => {
    instrumentChange(newValue);
    instrumentSelectList.value = newValue;
})


