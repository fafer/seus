'use strict';

const selfsigned = require('selfsigned');
const { HOST } = require('../../../conf');

function createCertificate(attrs) {
  return selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days: 30,
    keySize: 2048,
    extensions: [
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost',
          },
          {
            type: 2,
            value: '[::1]',
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1',
          },
          {
            type: 7,
            ip: 'fe80::1',
          },
          ...Object.values(HOST).map(d => {
            return {
              type: 2,
              value: d,
            };
          }),
        ],
      },
    ],
  });
}

function ssl(options = {}) {
  let fakeCert;
  if (!options.key || !options.cert) {
    const attrs = [
      {
        name: 'commonName',
        value: 'localhost',
      },
    ];
    const pems = createCertificate(attrs);
    fakeCert = pems.private + pems.cert;
  }
  return {
    key: options.key || fakeCert,
    cert: options.cert || fakeCert,
  };
}

module.exports = ssl;
