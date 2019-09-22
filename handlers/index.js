const homeHandler = require('./home');
const staticFiles = require('./static-files');
const searchCats = require('./searchCat');
const cat = require('./cat');

module.exports = [homeHandler, staticFiles, cat, searchCats];