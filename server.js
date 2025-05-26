const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Hanya tangani permintaan POST ke rute /api.live
  if (req.method === 'POST' && path === '/api.live') {
    // Tangani permintaan POST di sini (seperti yang Anda lakukan sebelumnya)
    // ...
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Permintaan POST berhasil diterima.' }));
  } else {
    // Tangani permintaan yang tidak diinginkan dengan respons kode status 405 (Method Not Allowed)
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Metode tidak diizinkan.' }));
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
