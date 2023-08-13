const http = require("http");
const path = require("path");
const fs = require("fs");

const itemsPath = path.join(__dirname, "items.json");
const port = 2000;

function requestHandler(req, res) {
  //Post items
  if (req.url === "/items" && req.method === "POST") {
    postItem(req, res);
  }
  //get items
  if (req.url === "/items" && req.method === "GET") {
    getItems(req, res);
  }
  //get one item with id
  if (req.url.startsWith("/items/") && req.method === "GET") {
    getOneItem(req, res);
  }
  if (req.url.startsWith("/items/") && req.method === "PATCH") {
    updateItem(req, res);
  }
  if (req.url.startsWith("/items/") && req.method === "DELETE") {
    deleteItem(req, res);
  }
}

const server = http.createServer(requestHandler);

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

//----------------function Handlers-----------------------

//************************Post items*******************
function postItem(req, res) {
  const preReadItem = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(preReadItem);
  const id = itemsArrayOfObj[itemsArrayOfObj.length - 1].id;
  const newId = id + 1;

  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const parseditems = Buffer.concat(body).toString();
    const newItemsToPost = JSON.parse(parseditems);

    itemsArrayOfObj.push({
      ...newItemsToPost,
      id: newId,
    });
    // console.log(itemsArrayOfObj);
    fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
      if (err) {
        serverError();
      }
      res.end(JSON.stringify(itemsArrayOfObj));
    });
  });
}

//************ Get Items **************************** */
function getItems(req, res) {
  fs.readFile(itemsPath, "utf-8", (err, data) => {
    if (err) {
      serverError();
    }
    res.end(data);
  });
}

//*************************Get one Items************** */
function getOneItem(req, res) {
  const id = req.url.split("/")[2];
  const itemfile = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(itemfile);
  const itemIndex = itemsArrayOfObj.findIndex((item) => {
    return item.id === parseInt(id);
  });
  if (itemIndex === -1) {
    res.writeHead("404");
    res.end("Items not found");
  }
  res.end(JSON.stringify(itemsArrayOfObj[itemIndex]));
}

//*************************Update Item************** */
function updateItem(req, res) {
  const id = req.url.split("/")[2];
  const itemfile = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(itemfile);
  const body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    const newItemsToPost = Buffer.concat(body).toString();
    const updateItems = JSON.parse(newItemsToPost);

    const itemIndex = itemsArrayOfObj.findIndex((item) => {
      return item.id === parseInt(id);
    });
    if (itemIndex === -1) {
      clientError();
    }
    itemsArrayOfObj[itemIndex] = {
      ...itemsArrayOfObj[itemIndex],
      ...updateItems,
    };
    // write the file
    fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
      if (err) {
        clientError();
      }
      res.end(JSON.stringify(itemsArrayOfObj));
    });
  });
}

//*************************Delete Item************** */
function deleteItem(req, res) {
  const id = req.url.split("/")[2];
  const itemfile = fs.readFileSync(itemsPath);
  const itemsArrayOfObj = JSON.parse(itemfile);

  const itemIndex = itemsArrayOfObj.findIndex((item) => {
    return item.id === parseInt(id);
  });
  if (itemIndex === -1) {
    clientError();
  }
  itemsArrayOfObj.splice(itemIndex, 1);
  fs.writeFile(itemsPath, JSON.stringify(itemsArrayOfObj), (err) => {
    if (err) {
      clientError();
    }
    res.end(JSON.stringify(itemsArrayOfObj));
  });
}

// ------------Error Handler------------------------
function serverError() {
  res.writeHead("500");
  res.end("internal server error");
}

clientError = () => {
  res.writeHead("404");
  res.end("Items not found");
};
