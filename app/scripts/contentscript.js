'use strict';

/* global async, saveAs */
/*jshint -W069 */

(function() {
  var pattern = 'var orders =';
  var pageNames = ['paidonly', 'payatpickup-notship', 'open', 'shippedonly',
                'history', 'canceled', ];
  var pageDesc = ['已付款待出貨訂單', '超商取貨付款待出貨訂單', '等候付款訂單',
                '已出貨訂單', '已完成訂單', '取消的訂單'];

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

  function push(line, content) {
    line.push('"' + content + '"');
  }

  function appendRow(line, columns) {
    columns.forEach(function(col) {
      push(line, col);
    });
  }

  function getCSV(sheets) {
    var header = '"訂單編號","姓名","地址","電話","發票抬頭", "統編", "產品","數量",'+
                  '"金額","小計金額","總金額","運費","金流手續費","折扣","備註",' +
                  '"分類"';
    var csv = [];
    csv.push(header);
    var props = Object.keys(sheets);
    props.forEach(function(prop) {
      sheets[prop].forEach(function(order) {
        var line = [];
        appendRow(line, [
          order['oid'], order['name'], order['address'], order['tel'],
          order['taxtitle'], order['taxid'], order['title'], order['quantity'],
          order['price'], order['subtotal'], order['payment'],
          order['handling'], order['payment_fee'], order['reward_deduct'],
          order['message'], prop
        ]);
        csv.push(line.join(','));
      });
    });
    return csv.join('\n');
  }

  chrome.runtime.onMessage.addListener(function(message) {
    var sheets = {};

    var tasks = pageNames.map(function(name, index) {
      return function(done) {
        if (message.include.indexOf(name) === -1) {
          return done();
        }
        chrome.runtime.sendMessage({fetching: pageDesc[index]});
        getSheet([], name, 1, function(allOrders) {
          var desc = pageDesc[index];
          sheets[desc] = allOrders;
          done();
        });
      };
    });
    async.series(tasks, function() {
      console.log(sheets);
      var blob;
      if (message.type === 'json') {
        blob = new Blob([JSON.stringify(sheets, null, 2)],
          {type: 'text/plain;charset=utf-8'});
        saveAs(blob, 'pinkoi.txt');
      } else {
        var csv = getCSV(sheets);
        blob = new Blob([csv], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, 'pinkoi.csv');
      }
      chrome.runtime.sendMessage({done: true});
    });
  });
})();
