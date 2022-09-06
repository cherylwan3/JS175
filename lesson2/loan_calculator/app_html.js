const HTTP = require('http');;
const URL = require('url').URL;
const PORT = 3000;

function createHTML(APR, amount, duration, monthlyPayment) {
  const HTML_START = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Loan Calculator</title>
        <style type="text/css">
          body {
            background: rgba(250, 250, 250);
            font-family: sans-serif;
            color: rgb(50, 50, 50);
          }

          article {
            width: 100%;
            max-width: 40rem;
            margin: 0 auto;
            padding: 1rem 2rem;
          }

          h1 {
            font-size: 2.5rem;
            text-align: center;
          }

          table {
            font-size: 1.5rem;
          }
          th {
            text-align: right;
          }
          td {
            text-align: center;
          }
          th,
          td {
            padding: 0.5rem;
          }
        </style>
      </head>
      <body>
        <article>
          <h1>Loan Calculator</h1>
          <table>
            <tbody>`;

    const HTML_END = `
            </tbody>
          </table>
        </article>
      </body>
    </html>`;

  let content = 
  `<tr>
    <th>Amount:</th>
    <td><a href="/?amount=${amount-100}&duration=${duration}">- $100</a></td>
    <td>$${amount}</td>
    <td><a href="/?amount=${amount+100}&duration=${duration}">+ $100</a></td>
  </tr>
  <tr>
    <th>Duration:</th>
    <td><a href="/?amount=${amount}&duration=${duration - 1}">- 1 year</a></td>
    <td>${duration} year(s)</td>
    <td><a href="/?amount=${amount}&duration=${duration + 1}">+ 1 year</a></td>
  </tr>
  <tr>
    <th>APR:</th>
    <td colspan='3'>${APR}%</td>
  </tr>
  <tr>
    <th>Monthly Payment:</th>
    <td colspan='3'>$${monthlyPayment}</td>
  </tr>`; 
  
  return `${HTML_START}${content}${HTML_END}`
}

function getParams(path) {
  const myURL = new URL(path, `http://localhost:${PORT}`);
  return myURL.searchParams;
}

function isInvalid(amount, duration) {
  return (amount === 0) || (duration === 0);
}

function calculateMonthlyPayment(APR, amount, duration) {
  if (isInvalid(amount, duration)) return 0;
  
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

  return createHTML(APR, amount, duration, monthlyPayment);
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;

  if (path == '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let content = createLoanOffer(getParams(path));
  
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});