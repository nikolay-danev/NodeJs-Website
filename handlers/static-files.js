const url = require('url');
const fs = require('fs');
const path = require('path');

function getContentType(url){
    if(url.endsWith('css')){
        return 'text/css';
    }
    else if(url.endsWith('html')){
        return 'text/html'
    }
    else if(url.endsWith('png') || url.endsWith('jpeg') ||url.endsWith('jpg') || url.endsWith('ico')){
        return 'image/'
    }
    else if(url.endsWith('js')){
        return 'text/javascript'
    }
    else if(url.endsWith('json')){
        return 'application/json'
    }
}

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if(pathname.startsWith('/content') && req.method === 'GET'){

            let filePath = path.normalize(path.join(__dirname, '..' + pathname));
        let contentType = getContentType(pathname);
        let encoding = 'utf-8';
        if(filePath.endsWith('png') || filePath.endsWith('jpeg') || filePath.endsWith('jpg') || filePath.endsWith('ico')){
            encoding = '';
            contentType += filePath.split('.').pop();
        };

            fs.readFile(filePath, encoding, (err, data) => {
                if(err){
                    console.log(err);
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.write('Content not found!');
                    res.end();
                }
                else{
                    console.log(pathname);
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.write(data);
                    res.end();
                }
            });
    }
    return true;
}