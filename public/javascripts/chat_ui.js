$(function () {
  "use strict";

  var socket = io();
  var chat = new ChatApp.Chat(socket);

  // need to broadcast name change to whole room
  socket.on('nicknameChangeResult', function (data) {
    if (data.success) {
      socket.emit("updateUsersList");
    }
    chat.addMessage(data.message);
  });

  socket.on("updateUsersList", function (nicknames) {
    var $users = $("ul.users");
    $users.empty();
    for (var user in nicknames) {
      var $li = $("<li>").text(nicknames[user]);
      $users.append($li);
    }
  });

  $(".message-form").on("submit", function (event) {
    event.preventDefault();
    var $field = $(this).find("input");
    var messageText = $field.val();
    $field.val("");

    if (/^\//.test(messageText)) {
      chat.processCommand(messageText);
    } else {
      chat.sendMessage(messageText);
    }
  });
});
