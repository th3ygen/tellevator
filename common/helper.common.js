const { green, yellow, red } = require('chalk');
module.exports = {
    sleep: (t) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve();
            }, t);
        });
    },

    rnd: (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    log: (path, msg, status) => {
        let head = '';
        switch (status) {
            case 'success':
                head = green(`[${path.replace('.', ' -> ')}]`);
                break;
            case 'warn':
                head = yellow(`[${path.replace('.', ' -> ')}]`);
                break;
            case 'error':
                head = red(`[${path.replace('.', ' -> ')}]`);
                break;
            default: 
                head = green(`[${path.replace('.', ' -> ')}]`);    
                break;
        }
        console.log(head, msg);
    },
}