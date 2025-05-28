const express = require('express');
const request = require('request');

const app = express();

app.use(express.json());

app.get('/sendToGemini', (req, res) => {
  const message = req.query.message;
  const url = `https://dev-the-dark-lord.pantheonsite.io/wp-admin/js/Apis/Gemini.php?message=${encodeURIComponent(message)}`;

  request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      res.send(body);
    } else {
      res.status(response.statusCode).send(error);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
