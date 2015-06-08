'use strict';

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded');

  var buttons = document.getElementsByClassName('fetch-orders');
  Array.prototype.forEach.call(buttons, function(button) {
    button.addEventListener('click', function() {
      console.log('fetching');
      var checkboxes = document.getElementsByClassName('exclude-type');
      var excludeTypes = [];
      Array.prototype.forEach.call(checkboxes, function(box) {
        if (box.checked) {
          console.log(box.dataset.type);
          excludeTypes.push(box.dataset.type);
        }
      });
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var msg = {type: button.dataset.type, exclude: excludeTypes};
        chrome.tabs.sendMessage(tabs[0].id, msg);
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


