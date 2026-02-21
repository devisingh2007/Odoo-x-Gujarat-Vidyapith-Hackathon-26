import dns from 'dns';

const srvRecord = '_mongodb._tcp.fleetflow.q7ze4ia.mongodb.net';

console.log(`Resolving SRV record: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
    if (err) {
        console.error('DNS Resolution Error:', err);
    } else {
        console.log('Successfully resolved SRV record:');
        console.log(addresses);
    }
});

const hostname = 'fleetflow.q7ze4ia.mongodb.net';
console.log(`Resolving hostname: ${hostname}`);
dns.resolve4(hostname, (err, addresses) => {
    if (err) {
        console.error('DNS Resolve4 Error:', err);
    } else {
        console.log('Successfully resolved IPv4:');
        console.log(addresses);
    }
});
