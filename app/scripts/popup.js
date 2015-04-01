'use strict';

var goBtn = document.getElementById('go');
goBtn.addEventListener('click', function() {
  var total = parseInt(document.getElementById('total').value);
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {total: total});
  });
});
