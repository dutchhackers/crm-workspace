'use strict';

const https = require('node:https');
const gsheet = require('google-spreadsheet');
const { GoogleSpreadsheet, GoogleSpreadsheetRow } = gsheet;


const options = {
  port: 443,
  method: 'GET',
  headers: {
    "Authorization": "Bearer {}"
  }
};

// const date = new Date();
const date = new Date('2023-03-01'); // Specific

const from = date;
const to = new Date(date.toISOString());
to.setDate(to.getDate() + 37);

const url = new URL('/v3/reservations', 'https://api.bookmydesk.com/');
url.searchParams.append('companyId', '0c3be35f-4cc7-42b1-91d4-ec1383609332');
url.searchParams.append('from', from.toISOString().split('T')[0]);
url.searchParams.append('to', to.toISOString().split('T')[0]);
url.searchParams.append('allForCompany', 'true');

const req = https.request(url, options, (res) => {
  console.log('statusCode:', res.statusCode);
  let body = [];

  res.on('data', (chunk) => {
    // process.stdout.write(d);
    body.push(chunk);
  });

  res.on('end', () => {
    body = Buffer.concat(body).toString();
    processData(JSON.parse(body));
  })
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

function processData(data) {
  const { meta, result } = data;

  const map = result.items
    .reduce((map, item) => {
      const { id, email } = item.user;
      if (id) {
        map.set(email, id);
      }
      return map;
    }, new Map());

  // console.log(map);
  updateSheet(map);
}

const doc = new GoogleSpreadsheet('1nuDQelPTBrPI__6DIRDhsDYIfhSJ_D9yA0PlmPfrfek');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function updateSheet(map) {
  // const map = new Map();
  await doc.useServiceAccountAuth({
    client_email: '',
    private_key: '',
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByTitle['Employees'];

  const rows = await sheet.getRows();


  rows
    .filter(row => map.has(row.Id))
    .forEach(async (row, i) => {
      const email = row.Id;

      await delay(i * 5000); // Don't get `RESOURCE_EXHAUSTED`

      console.log(email, map.get(email));
      row.BookMyDesk = map.get(email);
      await row.save();
    })

}
