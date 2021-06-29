"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    identity: 'development',
    ip: '192.168.9.196',
    port: 4004,
    database: 'storage_test.db',
    secret: "supercalifragilinonseispiritoso",
    cams: [{
            xaddr: "http://192.168.9.40:8999/onvif/device_service",
            urn: 'urn:uuid:1dbfc5f9-33ea-a633-6373-002a2a393813',
            name: "Esterna",
            username: "admin",
            password: "videocam.2019",
        }, {
            xaddr: "http://192.168.9.41/onvif/device_service",
            urn: 'uuid:ed84c541-accf-4fdf-9c28-2a6f83ee2175',
            name: "Interna",
            username: "ov_user",
            password: "_..salo_9102.._",
        }]
};
//# sourceMappingURL=env_dev.js.map