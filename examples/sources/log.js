// will be needed when we replaced all console.xxx statements with log.xxx
var log = require('npmlog');

console.info('info ', 1);
console.log('log ', 2);
console.warn('warn ', 3);
console.error('error ', new Error('oh my!'));
