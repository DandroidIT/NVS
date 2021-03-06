export default {
  identity: 'development',
  debug: { offLog: true, writeLog: true },
  percentage_HD_space_reserved: 20,
  space_max_GB_media: 20,
  serversStatic: false,
  serversStaticFolder: '../webclient',
  serversStaticRoute: '/',
  cert_key: './ssl/server_dev.key',
  cert_crt: './ssl/server_dev.crt',
  ip: '192.168.1.1',
  port: 4004,
  database: 'storage.db',
  secret: 'secretstring',
  tokenExpiresIn: '1d',
  cams: [{
    xaddr: 'http://192.168.1.10:8999/onvif/device_service',
    urn: 'urn:uuid:abc-xxxx-axxx-xxx-xxxabcxxxx',
    name: 'demo cam',
    username: 'admin',
    password: 'password',
  }]
}