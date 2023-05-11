
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
function resetPage() {
    keyboardDiv.innerText = "";
    removeEventListener("keydown", playNoteOnKeyDown)
    removeEventListener("keyup", releaseNoteOnKeyUp)
}
function playNote(keyCode, remoteNote = false) {
    if (!keyboardNotes.hasOwnProperty(keyCode)) return
    let pressedKeyDiv = document.getElementById(keyboardNotes[keyCode].replace(",", ""))
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
    pianoEvent(keyCode, remoteNote)
    if (multiplayerFlag && !remoteNote)
        socket.emit("keyDownRemote", keyCode, sessionStorage.getItem("roomId"))
}
function releaseNote(keyCode, remoteNote = false) {
    if (!keyboardNotes.hasOwnProperty(keyCode)) return
    let pressedKeyDiv = document.getElementById(keyboardNotes[keyCode].replace(",", ""))
    if (!pressedKeyDiv.classList.contains("pressed")) return
    pianoEvent(keyCode, remoteNote)
    if (multiplayerFlag && !remoteNote)
        socket.emit("keyUpRemote", keyCode, sessionStorage.getItem("roomId"))
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
    if (currentOctave == +newValue) return
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
    socket.emit("octaveChange", currentOctave, sessionStorage.getItem("roomId"))
}
function pianoEvent(keyCode, remoteNote) {
    let keyDiv = document.getElementById(keyboardNotes[keyCode].replace(",", ""))
    keyDiv.classList.toggle("pressed")
    if (remoteNote) keyDiv.classList.toggle("secondPlayer")
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
    return roomId.value.trim().length > 0 ? true : false
}
function copyRoomId() {
    navigator.clipboard.writeText(roomId.value.trim() || socket.id);
}
function instrumentChange(newInstrument) {
    if (instrument.name == newInstrument) return
    instrument = Synth.createInstrument(newInstrument)
    if (multiplayerFlag)
        socket.emit("instrumentChange", newInstrument, sessionStorage.getItem("roomId"));
}
function volumeChange(newVolume) {
    Synth.setVolume(newVolume)
}
function restrictConfigurations() {
    instrumentSelectList.disabled = true;
    octaveInput.disabled = true;
}
function showToast(status, header, body) {
    if (status) {
        successToastBody.innerText = body;
        successToastHeader.innerText = header
    }
    else {
        errorToastBody.innerText = body;
        errorToastHeader.innerText = header
    }
    const toast = (status) ? bootstrap.Toast.getOrCreateInstance(successToastDiv) : bootstrap.Toast.getOrCreateInstance(errorToastDiv)
    toast.show();
}
function toggleChatWindow() {
    chatWindow.classList.toggle('d-none');
    if (chatWindow.classList.contains("d-none")) {
        if (+notificationCount.innerText > 0)
            notificationCount.classList.remove("d-none")
        else
            notificationCount.classList.add("d-none")
    }
}