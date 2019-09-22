const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const homeHandler = require('./home');
const path = require('path');
module.exports = (req, res) => {

    const pathname = url.parse(req.url).pathname;

    if (pathname === '/search') {
        let queryParams = qs.parse(req.url);
        let textToSearch = queryParams["/search?searchText"];

        let cats = JSON.parse(fs.readFileSync('data/cats.json', 'utf-8'));
        let filteredCats = cats.filter((cat) => cat.name.toLocaleLowerCase().includes(textToSearch.toLocaleLowerCase()));
        let filePath = path.normalize(path.join(__dirname, '../views/home/index.html'))

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.write('Page not found!');
                res.end();
            }
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            let catsList = filteredCats.map((cat) => `<li>
            <img src="../../content/images/${cat.image}" alt="${cat.name}">
            <h3>${cat.name}</h3>
            <p><span>Breed: </span>${cat.breed}</p>
            <p><span>Description: </span>${cat.description}</p>
            <ul class="buttons">
                <li class="btn edit"><a href="/edit-cat/${cat.id}">Change Info</a></li>
                <li class="btn delete"><a href="/shelter-cat/${cat.id}">New Home</a></li>
            </ul>
        </li>`);

            let modifiedData = data.toString().replace('{{cats}}', catsList);
            res.write(modifiedData);
            res.end();
        });
    }
}