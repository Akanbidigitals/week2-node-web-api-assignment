const http = require("http");
const path = require("path");
const fs = require("fs");

const port = 4000;
const htmlpath = path.join(__dirname, "index.html");
const errorpath = path.join(__dirname, "error.html");

function requestHandler(req, res) {
  if (req.url === "/") {
    gethtmlPage(req, res);
  }
  if (req.url.endsWith(".html") && req.method === "GET") {
    try {
      getwebRequestedUrl(req, res);
    } catch (error) {
      geterrorPage(req, res);
    }
  }
}

const server = http.createServer(requestHandler);

server.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});

// ********************************Utilitie functions***********************************
function gethtmlPage(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(fs.readFileSync(htmlpath));
}

function getwebRequestedUrl(req, res) {
  const splitHtml = req.url.split("/")[1];
  const pathSplitted = path.join(__dirname, splitHtml);
  const splitedWeb = fs.readFileSync(pathSplitted);
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(splitedWeb);
}

function geterrorPage(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(404);
  res.end(fs.readFileSync(errorpath));
}
