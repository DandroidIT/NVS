"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    identity: 'development',
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
};
//# sourceMappingURL=env_dev_sample.js.map