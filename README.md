# meep-provision
Provision new servers.

## Usage:

```javascript
const provision = require('./');
provision({
  server: {
    host: '192.160.0.1',
    port: 22,
    user: 'root',
    password: 'some_password'
  }
}, (failed) => {
  if(failed) throw failed
  // Provisioning is done.
});
```
