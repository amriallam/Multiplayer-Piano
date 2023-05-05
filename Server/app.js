const io = require("socket.io")(3000, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log('\x1b[36m%s', `${socket.id} Connected`);
  socket.on("checkRoomExistance", (lobbyId) => {
    if (io.sockets.adapter.rooms.get(lobbyId)) {
      socket.emit("RoomResult", 1);;
    } else {
      socket.emit("RoomResult", 0);
    }
  });
  socket.on("createRoom", () => {
    socket.join(socket.id);
    console.log('\x1b[35m%s', `${socket.id} Hosted his own room`)
  })
  socket.on("joinMe", (lobbyId, userName) => {
    io.to(lobbyId).emit("userJoined", userName)
    socket.join(lobbyId);
    console.log('\x1b[33m%s', `${socket.id} Joined ${lobbyId}`);
  });
  socket.on('disconnect', () => {
    console.log('\x1b[31m%s', `${socket.id} Disconnected`);

  });
  socket.on('send-message', (massage, sender, lobbyId) => io.to(lobbyId).emit("receive-message", massage, sender));
  socket.on('leaveLobby', (lobbyId, userId) => {
    socket.leave(lobbyId);
    io.to(lobbyId).emit("leftLobby", userId);
    console.log('\x1b[35m%s', `${socket.id} Hosted his own room`)
  }
  );
  socket.on('keyDownRemote', (keyCode, lobbyId) => io.to(lobbyId).emit('keyDownTrigger', keyCode))
  socket.on('keyUpRemote', (keyCode, lobbyId) => io.to(lobbyId).emit('keyUpTrigger', keyCode))
  socket.on("octaveChange", (newOctave, lobbyId) => io.to(lobbyId).emit('octaveChangeTrigger', newOctave))
  socket.on("instrumentChange", (newInstrument, lobbyId) => io.to(lobbyId).emit('instrumentChangeTrigger', newInstrument))
});
