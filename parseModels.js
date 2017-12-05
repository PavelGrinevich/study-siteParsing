const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const rp = require('request-promise');

function parse($) {
  if (!fs.existsSync('mobiles')) fs.mkdir('mobiles', err => { if (err) throw err });

  const phonesImgArray = $('div.product_block img.pr-line_thumb');
  const phonesPricesCashArray = $('div.product_block div.pr-price_cash a.pr-price_mark');
  const phonesPricesCashlessArray = $('div.product_block div.pr-price_cashless a.pr-price_mark');
  const phonesDescrArray = $('div.product_block div.pr-line_descr');

  const length = phonesImgArray.length;

  for (let i = 0; i < length; i++) {

    let phoneName = $(phonesImgArray[i]).attr('title');
    let phoneImageLink = $(phonesImgArray[i]).attr('src');
    let extansion = phoneImageLink.match(/\.\D{3,4}$/i)[0];

    phoneName = phoneName.replace(/ /g, '_');
    phoneName = phoneName.replace(/\//g, '_');

    if (!fs.existsSync('mobiles/' + phoneName)) fs.mkdir(('mobiles/' + phoneName), err => { if (err) throw err });

    let readableStream = request(phoneImageLink);
    let writeableStream = fs.createWriteStream('mobiles/' + phoneName + '/' + phoneName + extansion);
    readableStream.pipe(writeableStream);


    let phoneCashValue = $(phonesPricesCashArray[i]).text();

    fs.writeFile(('mobiles/' + phoneName + '/description.txt'), 'Розница: ' + phoneCashValue + '\r\n', err => {

      if (err) throw err;
    });

    let phoneCashlessValue = $(phonesPricesCashlessArray[i]).text();

    fs.appendFile(('mobiles/' + phoneName + '/description.txt'), 'Безнал: ' + phoneCashlessValue + '\r\n\r\n', err => {

      if (err) throw err;
    });

    let phoneDescription = $(phonesDescrArray[i]).text();

    fs.appendFile(('mobiles/' + phoneName + '/description.txt'), 'Описание:\r\n\r\n' + phoneDescription, err => {

      if (err) throw err;
    });
  }

  console.log('Ready');
}

module.exports = function(url) {
  return rp(url)
    .then(cheerio.load)
    .then(parse)
    .catch(console.error);
};