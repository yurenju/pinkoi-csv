'use strict';

var pageNames = ['paidonly', 'payatpickup-notship', 'open', 'shippedonly',
              'history', 'canceled', ];
var pageDesc = ['已付款待出貨訂單', '超商取貨付款待出貨訂單', '等候付款訂單',
              '已出貨訂單', '已完成訂單', '取消的訂單'];

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded');

  var buttons = document.getElementsByClassName('fetch-orders');
  Array.prototype.forEach.call(buttons, function(button) {
    button.addEventListener('click', function() {
      console.log('fetching');
      var checkboxes = document.getElementsByClassName('include-type');
      var includeTypes = [];
      Array.prototype.forEach.call(checkboxes, function(box) {
        if (box.checked) {
          console.log(box.dataset.type);
          includeTypes.push(box.dataset.type);
        }
      });
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var msg = {type: button.dataset.type, include: includeTypes};
        chrome.tabs.sendMessage(tabs[0].id, msg);
      });
    });
  });

  var progress = document.getElementById('progress');

  var types = document.getElementById('types');
  var inputs = pageNames.map(function(name, index) {
    return '<div><label><input class="include-type" type="checkbox" data-type="' +
                name + '"> ' + pageDesc[index] + '</label></div>';
  });
  types.innerHTML = inputs.join(' ');

  document.getElementById('select-all').addEventListener('click', function() {
    var types = document.querySelectorAll('.include-type');
    Array.prototype.forEach.call(types, function(t) {
      t.checked = true;
    });
  });

  document.getElementById('deselect-all').addEventListener('click', function() {
    var types = document.querySelectorAll('.include-type');
    Array.prototype.forEach.call(types, function(t) {
      t.checked = false;
    });
  });

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


