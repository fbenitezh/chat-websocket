const fs = require("fs");

class Contenedor {
  constructor(nameFile) {
    this.nameFile = nameFile;
  }

  async save(data) {
    try {
      let contenido = await fs.promises.readFile(this.nameFile, "utf-8");
      data.id = 1;
      if (contenido != "") {
        contenido = JSON.parse(contenido);
        data.id = contenido[contenido.length - 1].id + 1;
      }
      let array = [
        ...contenido,
        data
      ];
      await fs.promises.writeFile(
        this.nameFile,
        JSON.stringify(array, null, 2)
      );
      //console.log(`subido el producto ${data.name}`);
      return data.id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getAll() {
    try {
      let content = await fs.promises.readFile(this.nameFile, "utf-8");
      if (content == "") return [];
      return JSON.parse(content);
    } catch (error) {
      throw new Error(error);
    }
  }

}

module.exports = Contenedor;
