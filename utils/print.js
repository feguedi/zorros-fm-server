const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

exports.printLog = (...messages) => (isDev ? console.log(...messages) : () => {});

exports.printError = (message) => (isDev ? console.error(message) : () => {});

exports.printTable = (table) => (isDev ? console.table(table) : () => {});
