(function() {
  "use strict";

  if (typeof ChatApp === "undefined") {
    window.ChatApp = {}
  }

  var Chat = ChatApp.Chat = function (socket) {
    this.socket = socket;
    this.socket.on('message', this.addMessage.bind(this));
  };

  Chat.prototype.processCommand = function (command) {
    if (/^\/nick/.test(command)) {
      var nickname = command.match(/\/nick\s(.*)/)[1];
      this.socket.emit("nicknameChangeRequest", nickname);
    } else if (/^\/join/.test(command)) {
      var room = command.match(/\/join\s(.*)/)[1];
      this.socket.emit("roomChangeRequest", room);
    } else {
      throw "Cannot process this command";
    }
  };

  Chat.prototype.addMessage = function (message) {
    var messageText;
    if (message['user']) {
      messageText = message['user'] + ": " + message.text;
    } else {
      messageText = message;
    }
    var $li = $("<li class='message'>").text(messageText);
    $("ul.messages").prepend($li);
  };

  Chat.prototype.sendMessage = function (text) {
    this.socket.emit('message', {
      text: text,
      room: this.room
    });
  };

}());
