var chatServer = {

  guestnumber: 1,
  nicknames: {},

  createChat: function (server) {
    var io = require('socket.io')(server);
    var server = this;
    io.on('connection', function (socket) {
      console.log(socket.id + " connected")

      server.nicknames[socket.id] = "guest" + server.guestnumber;
      socket.emit('nicknameChangeResult', {
        success: true,
        message: "Your nickname is " + server.nicknames[socket.id]
      });

      server.guestnumber += 1;

      socket.on('message', function (data) {
        data["user"] = server.nicknames[socket.id];
        io.emit('message', data);
      });

      socket.on('nicknameChangeRequest', server.processNicknameRequest.bind(server, socket));

      socket.on('disconnect', function () {
        io.emit('message', server.nicknames[socket.id] + " has disconnected.")
        delete server.nicknames[socket.id];
      });
    });
  },

  processNicknameRequest: function (socket, nickname) {
    if (this.isValidNickname(nickname)) {
      socket.emit('nicknameChangeResult', {
        success: true,
        message: this.nicknames[socket.id] + " has changed their name to " + nickname
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
