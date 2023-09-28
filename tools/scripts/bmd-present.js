'use strict';
const https = require('node:https');

const options = {
  port: 443,
  method: 'GET',
  headers: {
    "Authorization": "Bearer {}"
  }
};

const date = new Date();
// const date = new Date('2023-03-22'); // Specific

const from = date;
const to = new Date(date.toISOString());
to.setDate(to.getDate() + 1);

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

const users = [
  {
    name: 'Cas',
    streetName: 'Squirrel',
    emoji: ':shipit:',
    userId: '4ffa24a2-ac53-41ce-8896-1b0b0bacc15c'
  },
  {
    name: 'Michael',
    streetName: 'RoboCop',
    emoji: ':michael_knight:',
    userId: '29f9e8a8-01c3-4045-b3fa-913790b69866'
  },
  {
    name: 'Aalt',
    streetName: 'Tailwind hooligan',
    emoji: ':tailwind:',
    userId: 'c215960a-44a6-4163-8681-16a6a357a2e7'
  },
  {
    name: 'Guido',
    streetName: 'Reisleider',
    emoji: ':guide_dog:',
    userId: '61140834-d21b-4e3b-a9ae-749cba152e4c'
  },
  {
    name: 'Sander',
    streetName: 'Rabo flirter',
    emoji: ':baby-yoda:',
    userId: 'c4c80830-552e-44d9-8f05-817b4e937ef0'
  },
  {
    name: 'Paul',
    streetName: 'FE Teamlead',
    emoji: ':paulgoossens:',
    userId: 'caabaa75-5912-4444-ba30-6f8d19f82e21'
  },
  {
    name: 'Nick',
    streetName: 'Drillrap manager',
    emoji: ':drop_mic:',
    userId: '005e7eac-2e52-4419-ba6f-fa1949747896'
  }
]

const usersMap = users.reduce((map, user) => {
  const { userId } = user;
  delete user.userId;

  map.set(userId, user)

  return map;
}, new Map());

const userIds = Array.from(usersMap.keys());

function processData(data) {
  const { meta, result } = data;

  const map = result.items
    .filter(item => userIds.includes(item.user.id))
    .filter(item => item.status !== "expired")
    .map(item => {
      const user = usersMap.get(item.user.id);

      let loc = item.type === 'home' ? 'home' : 'office';

      if (loc === 'office') {
        loc = item.seat.map.location.name === 'Extern' ? 'extern' : 'office';
      }

      return ({
        user,
        location: loc
      });
    })
    .reduce((map, user) => {

      if (!map.has(user.location)) {
        map.set(user.location, []);
      }

      const arr = map.get(user.location);
      arr.push(user.user)

      return map;
    }, new Map());


  console.log(`:robot_face: :bmd:`);
  console.log(`:calendar: ${from.toLocaleDateString('nl-NL')}`);
  console.log('');
  for (const [loc, users] of map.entries()) {
    switch (loc) {
      case 'home':
        console.log(':wfh: Home');
        break;
      case 'office':
        console.log(':office: Office');
        break;
      case 'extern':
        console.log(':thomas-train: Extern');
        break;
    }
    users.forEach((user) => {
      console.log(`- ${user.emoji} ${user.name}`)
    })
    console.log('');
  }
}