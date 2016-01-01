'use strict';

const Egg = require('meep-egg');
const request = require('request');

const provision = function(options, callback) {

  let egg = new Egg({
    server: options.server,
    tasks: [
      'dpkg --configure -a',
      'apt-get install -y curl',
      'curl -sL https://deb.nodesource.com/setup_5.x | sudo -E bash -',
      'apt-get install -y nodejs',
      'mkdir -p .meep',
      `cd .meep && echo '{ "authKey": "${options.authKey}" }' > authkey.json`,
      'apt-get install -y git',
      'cd .meep && git clone https://github.com/MeepGroup/meep-hawk',
      'cd .meep/meep-hawk && npm i',
      'npm i -g pm2',
      'cd ~/.meep/meep-hawk && PM2_NODE_OPTIONS=\'-harmony-destructuring\' pm2 start reportingService.js'
    ],
    test: true,
    output: function(err, msg){
      if(err) {
        console.log(msg);
      }
    }
  });

  // Add the server to the trusted connections for rooster.
  request.get(`http://meeppanel.com:3001/trust/${options.server.host}`,
  function optionalCallback(err, httpResponse, body) {
    if(err) {
      console.log(err);
      callback({error: `Failed to trust address ${options.server.host}`});
    }else {
      console.log(`Successfully trusted ${options.server.host}, provisioning...`);
      egg.hatch().expect('node -v').match(new RegExp(/v5\..*\..*/), (res) => {
        if(typeof(res) !== 'null') {
          console.log('Successfully provisioned server!');
          callback({success: 'Successfully provisioned server!'});
        }
      });
    }
  });

};

module.exports = provision;
