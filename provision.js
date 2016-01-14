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
      'apt-get install -y nodejs git',
      'mkdir -p .meep',
      `cd .meep && echo '{ "authKey": "${options.authKey}" }' > authkey.json`,
      `cd .meep && echo "${options.meepConfig}" > meepConfig.js`,
      'cd .meep && git clone https://github.com/MeepGroup/meep-hawk',
      'cd .meep && git clone https://github.com/MeepGroup/meep-cmdshim',
      'cd .meep && git clone https://github.com/MeepGroup/meep-daemon',
      'cd .meep/meep-hawk && npm i',
      'cd .meep/meep-cmdshim && npm i',
      'cd .meep/meep-daemon && npm i',
      'npm i -g pm2',
      'cd ~/.meep/meep-hawk &&  pm2 start reportingService.js --node-args="--harmony-destructuring"',
      'cd ~/.meep/meep-cmdshim &&  pm2 start server.js --node-args="--harmony-destructuring"',
      'cd ~/.meep/meep-daemon &&  pm2 start daemon.js --node-args="--harmony-destructuring"'
    ],
    test: true,
    output: function(err, msg){
      if(err) {
        console.log(msg);
      }
    },
    tickCallback: options.tickCallback
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
