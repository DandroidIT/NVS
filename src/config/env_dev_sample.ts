export default {
  identity: 'development',
  serversStatic: false,
  serversStaticFolder: '../webclient',
  serversStaticRoute: '/',
  cert_key: './ssl/server_dev.key',
  cert_crt: './ssl/server_dev.crt',
  ip: '192.168.1.1',
  port: 4004,
  database: 'storage.db',
  secret: "secretstring",
  cams: [{
    xaddr: "http://192.168.1.10:8999/onvif/device_service",
    urn: 'urn:uuid:abc-xxxx-axxx-xxx-xxxabcxxxx',
    name: "demo cam",
    username: "admin",
    password: "password",
  }]
}