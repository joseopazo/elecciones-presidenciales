const http = require("http");
const fs = require("fs");
const url = require("url");

const {
  newPost,
  indexPosts,
  eliminar,
  editCandidato,
  transaccion,
  historial
} = require("./index");

const server = http.createServer(async (req, res) => {
  if (req.url === "/" && req.method === "GET") {
    fs.readFile("./index.html", (error, file) => {
      if (error) console.log(error);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(file);
    });
  } else if (req.url === "/candidato" && req.method === "POST") {
    let body;
    req.on("data", (datos) => (body = JSON.parse(datos)));
    req.on("end", async () => {
      const datos = await newPost(body);

      res.writeHeader(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(datos));
    });
  } else if (req.url === "/candidatos" && req.method === "GET") {
    const posts = await indexPosts();

    res.writeHeader(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(posts));
  } else if (req.url.startsWith("/candidato?id") && req.method == "DELETE") {
    const { id } = url.parse(req.url, true).query;
    const respuesta = await eliminar(id);
    res.end(JSON.stringify(respuesta));
  } else if (req.url == "/candidato" && req.method == "PUT") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const datos = Object.values(JSON.parse(body));
      const respuesta = await editCandidato(datos);
      res.end(JSON.stringify(respuesta));
    });
  } else if (req.url === "/votos" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const { estado, votos, ganador } = JSON.parse(body);
      const respuesta = await transaccion(estado,votos,ganador);
      console.log(respuesta)
      if (respuesta) {
        res.end(JSON.stringify({}));
      }else{ res.writeHead(500, { 'Content-Type': 'text/html' })
      res.end()
    
      }
    });

    
  } else if (req.url === "/historial" && req.method === "GET") {
    const respuesta = await historial();

    
    res.end(JSON.stringify(respuesta));
  }
  
});

server.listen(3000, (_) => console.log("servidor 3000 funcionando"));
