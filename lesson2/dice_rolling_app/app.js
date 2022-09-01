const HTTP = require('http');
const PORT = 3000;

const URL = require('url').URL;

const myURL = new URL('/some/path?color=red', 'http://my-website');
let params = myURL.searchParams;
console.log(params.get('color'));

function dieRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;

  if (path == '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let content = dieRoll(1, 6);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${content}\n`);
    res.write(`${method} ${path}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});