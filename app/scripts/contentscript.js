'use strict';

/* global saveAs */

chrome.runtime.onMessage.addListener(function() {
    var csv = ['訂單編號,姓名,地址,電話,發票開立,產品,數量,金額,備註'];

    var puts = document.querySelectorAll('.put');
    Array.prototype.forEach.call(puts, function(put) {
      var line = [];
      line.push(put.querySelector('.serial a').textContent);
      line.push(put.querySelector('.recipient i').textContent);
      line.push(put.querySelector('.address i').textContent);
      line.push(put.querySelector('.tel i').textContent);
      var tax = put.querySelector('.tax');
      line.push(tax ? tax.textContent : '');
      var items = put.querySelectorAll('.item');
      var itemsContent = [];
      Array.prototype.forEach.call(items, function(item, index) {
        index++;
        itemsContent.push(index + '. ');
        itemsContent.push(item.querySelector('.title').textContent);
        itemsContent.push(item.querySelector('.quantity').textContent);
      });
      line.push(itemsContent.join(' '));
      line.push(put.querySelector('.minisum').textContent);
      line.push(put.querySelector('.message').textContent);
      // console.log(line);
      csv.push(line.join(','));
    });
    var blob = new Blob([csv.join('\n')], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, 'pinkoi.csv');
});


