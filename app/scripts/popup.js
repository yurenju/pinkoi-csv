'use strict';

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded');

  var buttons = document.getElementsByClassName('fetch-orders');
  Array.prototype.forEach.call(buttons, function(button) {
    button.addEventListener('click', function() {
      console.log('fetching');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: button.dataset.type});
      });
    });
  });

  var progress = document.getElementById('progress');

  chrome.runtime.onMessage.addListener(
    function(request) {
      if (request.fetching) {
        progress.innerHTML += '擷取「' + request.fetching + '」⋯<br>';
      }

      if (request.done) {
        window.close();
      }
    });
});


