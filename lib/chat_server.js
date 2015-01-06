var chatServer = {

  guestnumber: 1,
  nicknames: {},
  currentRooms: {},

  createChat: function (server) {
    this.io = require('socket.io')(server);
    var server = this;
    this.io.on('connection', function (socket) {
      console.log(socket.id + " connected")

      // initial connection to server
      var nickname = "guest" + server.guestnumber;
      server.nicknames[socket.id] = nickname;

      // user joins lobby
      server.joinRoom(socket, 'lobby');
      socket.emit('nicknameChangeResult', {
        success: true,
        message: "Your nickname is " + nickname,
        nickname: nickname,
        room: 'lobby'
      });

      // update guestnumber
      server.guestnumber += 1;

      // listen events while on server
      socket.on('message', function (data) {
        data["user"] = server.nicknames[socket.id];
        server.io.to(data.room).emit('message', data);
      });

      socket.on("updateUsersList", server.broadcastUsersList.bind(server));

      socket.on('nicknameChangeRequest', server.processNicknameRequest.bind(server, socket));

      socket.on('roomChangeRequest', server.handleRoomChangeRequest.bind(server, socket));

      socket.on('disconnect', function () {
        var room = server.currentRooms[socket.id];
        server.io.to(room).emit('message', server.nicknames[socket.id] + " has disconnected.");
        delete server.nicknames[socket.id];
        delete server.currentRooms[socket.id];
        server.broadcastUsersList(room);
      });
    });
  },

  broadcastUsersList: function (data) {
    var nicknames = this.findNicknames(data.room);
    this.io.to(data.room).emit("updateUsersList", nicknames);
  },

  findNicknames: function (room) {
    var nicks = [];
    for (var socket in this.nicknames) {
      if (this.currentRooms[socket] === room) {
        nicks.push(this.nicknames[socket]);
      }
    }
    return nicks;
  },

  joinRoom: function (socket, room) {
    socket.join(room);
    this.currentRooms[socket.id] = room;
    this.io.to(room).emit('message', this.nicknames[socket.id] + " has joined the room.");
    this.broadcastUsersList({ room: room });
    socket.emit('updateRoom', room);
  },

  handleRoomChangeRequest: function (socket, room) {
    // leave old room
    var oldRoom = this.currentRooms[socket.id];
    this.io.to(oldRoom).emit('message', this.nicknames[socket.id] + " has left the room.");
    socket.leave(oldRoom);
    this.currentRooms[socket.id] = null;
    this.broadcastUsersList({ room: oldRoom });

    // join new room
    this.joinRoom(socket, room);
  },

  // need to broadcast name change to whole room
  processNicknameRequest: function (socket, nickname) {
    if (this.isValidNickname(nickname)) {
      socket.emit('nicknameChangeResult', {
        success: true,
        message: this.nicknames[socket.id] + " has changed their name to " + nickname,
        nickname: nickname,
        oldNickname: this.nicknames[socket.id],
        room: this.currentRooms[socket.id]
      });
      // set nickname
      this.nicknames[socket.id] = nickname;
    } else {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: "Invalid nickname request"
      });
    }
  },

  isValidNickname: function (nickname) {
    if (/guest\d+/i.test(nickname)) {
      return false;
    }
    for (var user in this.nicknames) {
      if (nickname == this.nicknames[user]) {
        return false;
      }
    }
    return true;
  }
};

exports.chatServer = chatServer;
