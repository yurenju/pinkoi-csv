'use strict';

/* global async, saveAs */

var pattern = 'var orders =';

function getSheet(allOrders, pageName, count, cb) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function() {
    var response = this.responseText;
    var parser = new DOMParser();
    var doc = parser.parseFromString(response, 'text/html');
    var scripts = doc.querySelectorAll('script');
    Array.prototype.forEach.call(scripts, function(script) {
      if (script.innerHTML.indexOf(pattern) !== -1) {
        var lines = script.innerHTML;
        lines.split('\n').forEach(function(line) {
          if (line.indexOf(pattern) !== -1) {
            var firstPos = line.indexOf('[');
            var lastPos = line.lastIndexOf(']')+1;
            var orders = JSON.parse(line.substring(firstPos, lastPos));
            Array.prototype.push.apply(allOrders, orders);
            if (orders.length > 0) {
              getSheet(allOrders, pageName, count+1, cb);
            } else {
              cb(allOrders);
            }
          }
        });
      }
    });
  });
  var url = 'http://www.pinkoi.com/panel/order?p='+pageName+'&page='+count;
  xhr.open('GET', url, true);
  xhr.send();
}

chrome.runtime.onMessage.addListener(function() {
  var sheets = {};
  var pageNames = ['paidonly', 'payatpickup-notship', 'open', 'shippedonly',
                'history', 'canceled', ];
  var pageDesc = ['已付款待出貨訂單', '超商取貨付款待出貨訂單', '等候付款訂單',
                '已出貨訂單', '已完成訂單', '取消的訂單'];
  var tasks = pageNames.map(function(name, index) {
    return function(done) {
      chrome.runtime.sendMessage({fetching: pageDesc[index]});
      getSheet([], name, 1, function(allOrders) {
        sheets[name] = allOrders;
        done();
      });
    };
  });
  async.series(tasks, function() {
    console.log(sheets);
    var blob = new Blob([JSON.stringify(sheets, null, 2)], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'pinkoi.txt');
    chrome.runtime.sendMessage({done: true});
  });
});


