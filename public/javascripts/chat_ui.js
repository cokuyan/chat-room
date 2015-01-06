$(function () {
  "use strict";

  var socket = io();
  var chat = new ChatApp.Chat(socket);

  socket.on('nicknameChangeResult', function (data) {
    if (data.success) {
      chat.addMessage(data.message)
    } else {
      chat.addMessage(data.message)
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
