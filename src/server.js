const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const moment = require("moment");
const app = express();
const PORT = 8080;
const handlebars = require("express-handlebars");
const Contenedor = require("./Contenedor");
const contenedor = new Contenedor("./public/productos.json");
const mensaje = new Contenedor('./public/mensajes.json');

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  handlebars({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

app.set("views", "./src/views");
app.set("view engine", "hbs");
app.use("/", express.static("./public"));

//evento para cuando un cliente se contecta
io.on("connection", async (socket) => {
  console.log("usuario conectado");
  socket.emit("connectionMessage", "Conexión socket establecida con éxito");
  
  const msjs = await mensaje.getAll();
  socket.emit("messageBack", msjs);

  //evento para capturar una desconexion
  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });

  socket.on("nuevoProducto", async (data) => {
    const producto = {
      name: data.name,
      price: data.price,
      thumbnail: data.photo,
    };
    await contenedor.save(producto);
    io.sockets.emit("updateProducto");
  });

  socket.on("messageFront", async (data) => {
    data.date = moment().format("DD/MM/YYYY HH:MM:SS");
    await mensaje.save(data);
    const msjs = await mensaje.getAll();
    io.sockets.emit("messageBack", msjs);
  });
});

app.get("/", (req, res) => {
  res.render("main", {
    solapaNombre: "Websockets - Franco Benitez",
  });
});

httpServer.listen(PORT, () => console.log("server on port 8080"));
