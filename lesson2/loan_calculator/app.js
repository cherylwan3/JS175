const HTTP = require('http');;
const URL = require('url').URL;
const PORT = 3000;

function dieRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getParams(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.searchParams;
}

function calculateMonthlyPayment(APR, amount, duration) {
  let annualInterestRate = Number(APR) / 100;
  let monthlyInterestRate = annualInterestRate / 12;
  let months = Number(duration) * 12;
  let monthlyPayment = Number(amount) *
                  (monthlyInterestRate /
                  (1 - Math.pow((1 + monthlyInterestRate), (-Number(months)))));

  return monthlyPayment.toFixed(2);
}

function createLoanOffer(params) {
  const APR = 5;
  let amount = Number(params.get('amount'));
  let duration = Number(params.get('duration'));
  let monthlyPayment = calculateMonthlyPayment(APR, amount, duration);

  let body = '';
  body += `Amount: $${amount}\n`;
  body += `Duration: ${duration} years\n`;
  body += 'APR: 5%\n';
  body += `Monthly payment: $${monthlyPayment}`;

  return body;
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;

  if (path == '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let content = calculateLoan(getParams(path));
  
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${content}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});