const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = JSON.parse(fs.readFileSync('data/cats.json', 'utf-8'));

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        renderContent(req, res, '../views/addCat.html');
    }
    else if (pathname === '/cats/add-breed' && req.method === 'GET') {
        renderContent(req, res, '../views/addBreed.html');
    }
    else if (pathname === '/cats/add-cat' && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, (error, fields, files) => {
            if (error) {
                throw error;
            }

            let oldFile = files.upload.path;
            let newFile = path.normalize(path.join(__filename, '../../content/images/' + files.upload.name));

            fs.rename(oldFile, newFile, (err) => {
                if (err) throw err;
                console.log('File saved successfully!');
            });

            fs.readFile('data/cats.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let cats = JSON.parse(data);
                cats.push({ id: cats.length + 1, ...fields, image: files.upload.name });
                let json = JSON.stringify(cats);

                fs.writeFile('data/cats.json', json, 'utf-8', () => {
                    console.log('Cat saved successfully!');
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                });
            });

        });

    }
    else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = "";

        req.on('data', (data) => {
            formData += data;
        });

        req.on('end', () => {

            let body = qs.parse(formData);

            fs.readFile('data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                let json = JSON.stringify(breeds);

                fs.writeFile('data/breeds.json', json, 'utf-8', () => console.log('Saved breed successfully!'))
            });
            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
    }
    else if (pathname.includes('/shelter-cat/') && req.method === 'GET') {
        renderContent(req, res, '../views/catShelter.html');
    }
    else if (pathname.includes('/shelter-cat/') && req.method === 'POST') {


        let id = Number(req.url.split('/').pop());
        let cat = cats.find(x => x.id === id);

        fs.readFile('data/cats.json', (err, data) => {
            if (err) {
                throw err;
            }

            let cats = JSON.parse(data);
            cats.pop(cat);
            let json = JSON.stringify(cats);

            fs.writeFile('data/cats.json', json, 'utf-8', () => {
                res.writeHead(302, { 'Location': '/' });
                res.end();
            });
        });
    }
    else if (pathname.includes('/edit-cat/') && req.method === 'GET') {
        renderContent(req, res, '../views/editCat.html');
    }
    else if (pathname.includes('/edit-cat/') && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) throw err;

            let id = Number(req.url.split('/').pop());
            let cats = JSON.parse(fs.readFileSync('data/cats.json', 'utf-8'))
            let cat = cats.find(x => x.id === id);

            if (files) {
                let oldFile = files.upload.path;
                let newFile = path.normalize(path.join(__filename, '../../content/images/' + files.upload.name));

                fs.rename(oldFile, newFile, (err) => {
                    if (err) throw err;
                    console.log('File saved successfully!');
                });

                cat.image = files.upload.name;
            }

            cat.name = fields['name'];
            cat.description = fields['description'];
            cat.breed = fields['breed'];

            cats[cat] = cat;
            let json = JSON.stringify(cats);
            fs.writeFile('data/cats.json', json, 'utf-8', () => {
                console.log('Cat saved successfully!');
                res.writeHead(302, { 'Location': '/' });
                res.end();
            });
        });
    }
    else {
        return true;
    }
}

function renderContent(req, res, filePath) {
    let fileName = path.normalize(path.join(__dirname, filePath));

    let pageSource = fs.createReadStream(fileName);
    pageSource.on('data', (data) => {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        let modifiedData = data;

        if (filePath === '../views/addCat.html') {
            let catBreeds = '';

            catBreeds = JSON.parse(fs.readFileSync('data/breeds.json', 'utf-8'))

            let catBreedsOptions = catBreeds.map((breed) => `<option value="${breed}">${breed}</option>`)
            modifiedData = data.toString().replace('{{catBreeds}}', catBreedsOptions);
        }
        else if (filePath === '../views/catShelter.html') {

            let id = Number(req.url.split('/').pop());
            let cats = JSON.parse(fs.readFileSync('data/cats.json', 'utf-8'))
            let cat = cats.find(x => x.id === id);

            modifiedData = data.toString()
                .replace('{{catName}}', cat.name)
                .replace('{{catNameDisabled}}', cat.name)
                .replace('{{catBreed}}', cat.breed)
                .replace('{{catDescription}}', cat.description)
                .replace('{{catImage}}', cat.image);
        }
        else if (filePath === '../views/editCat.html') {
            let id = Number(req.url.split('/').pop());
            let cats = JSON.parse(fs.readFileSync('data/cats.json', 'utf-8'))
            let cat = cats.find(x => x.id === id);
            let catBreeds = '';

            catBreeds = JSON.parse(fs.readFileSync('data/breeds.json', 'utf-8'))

            let catBreedsOptions = catBreeds.map((breed) => breed === cat.breed ? `<option value="${breed}" selected>${breed}</option>` : `<option value="${breed}">${breed}</option>`)
            modifiedData = data.toString()
                .replace('{{catName}}', cat.name)
                .replace('{{catNameDisabled}}', cat.name)
                .replace('{{catDescription}}', cat.description)
                .replace('{{catBreeds}}', catBreedsOptions);
        }
        res.write(modifiedData);
    });

    pageSource.on('end', () => {
        res.end();
    });

    pageSource.on('error', (err) => {
        console.log(err);
    });
}