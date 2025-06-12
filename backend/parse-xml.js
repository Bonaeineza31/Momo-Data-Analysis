const fs = require('fs');
const xml2js = require('xml2js');

const xml = fs.readFileSync('./data/momo.xml', 'utf8');
const parser = new xml2js.Parser();

parser.parseString(xml, (err, result) => {
  if (err) throw err;

  const smsList = result.smses.sms;

  smsList.forEach((sms) => {
    const body = sms.$.body;

    // do your regex magic here and console.log
    console.log(body); // test output
  });
});
