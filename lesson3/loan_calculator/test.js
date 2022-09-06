const HTTP = require('http');;
const URL = require('url').URL;
const PORT = 3000;
const HANDLEBARS = require('handlebars');

const SOURCE = `
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
        font-size: 2rem;
      }

      td,
      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
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
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(source);

function render(template, data) {
  let html = template(data);
  return html;
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
  let data = {};

  data.amount = Number(params.get('amount'));
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.duration = Number(params.get('duration'));
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.apr = APR;
  data.payment = calculateMonthlyPayment(APR, data.amount, data.duration);
  data.monthlyPayment = calculateMonthlyPayment(APR, amount, duration);

  return data;
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;

  if (path == '/favicon.ico') {
    res.statusCode = 404;
    res.end();
  } else {
    let data = createLoanOffer(getParams(path));
    let content = render(LOAN_OFFER_TEMPLATE, data);
  
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${content}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});