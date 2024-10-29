import mongoose from "mongoose";
import * as fs from "fs";
import { resolveSoa } from "dns";

const esquema = new mongoose.Schema(
  {
    nombre: String,
    imagen: String,
    niveles: Number,
    fecha: Date,
  },
  { versionKey: false }
);
const JuegoModel = new mongoose.model("juegos", esquema);

export const getJuegos = async (req, res) => {
  try {
    const { id } = req.params;
    const rows =
      id === undefined
        ? await JuegoModel.find()
        : await JuegoModel.findById(id);
    return res.status(200).json({ status: true, data: rows });
  } catch (error) {}
};

export const saveJuego = async (req, res) => {
  try {
    const { nombre, niveles, fecha } = req.body;
    const validacion = validar(nombre, niveles, fecha, req.file, "Y");
    if (validacion == "") {
      const nuevoJuego = new JuegoModel({
        nombre: nombre,
        niveles: niveles,
        fecha: fecha,
        imagen: "/uploads/" + req.file.filename,
      });
      return await nuevoJuego.save().then(() => {
        res.status(200).json({ status: true, message: "juego guardado" });
      });
    } else {
      return res.status(400).json({ status: false, errors: validacion });
    }
  } catch (error) {
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

export const updateJuego = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, niveles, fecha } = req.body;
    let imagen = "";
    let valores = { nombre: nombre, niveles: niveles, fecha: fecha };
    if (req.file != null) {
      imagen = "/uploads/" + req.file.filename;
      valores = {
        nombre: nombre,
        niveles: niveles,
        fecha: fecha,
        imagen: imagen,
      };
      await eliminarImagen(id);
    }
    const validacion = validar(nombre, niveles, fecha, req.file, "Y");
    if (validacion == "") {
      await JuegoModel.updateOne({ _id: id }, { $set: valores });
      res.status(200).json({ status: true, message: "juego actualizado" });
    } else {
      return res.status(400).json({ status: false, errors: validacion });
    }
  } catch (error) {
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

export const deleteJuego = async (req, res) => {
  try {
    const { id } = req.params;
    await eliminarImagen(id);
    await JuegoModel.deleteOne({ _id: id });
    res.status(200).json({ status: true, message: "juego eliminado" });
  } catch (error) {
    return res.status(500).json({ status: false, errors: [error.message] });
  }
};

const validar = (nombre, niveles, fecha, sevalida) => {
  var errors = [];
  if (nombre === undefined || nombre.trim() === "") {
    errors.push("el nombre no debe estar vacio");
  }
  if (niveles === undefined || niveles.trim() === "" || isNaN(niveles)) {
    errors.push("los niveles no debe estar vacio");
  }
  if (fecha === undefined || fecha.trim() === "" || isNaN(Date.parse(fecha))) {
    errors.push("la fecha no debe estar vacio y debe ser valida");
  }
  if (sevalida === "Y" && img === undefined) {
    errors.push("Selecciona una imagen en formato jpg o png");
  } else {
    if (errors != "") {
      fs.unlinkSync("./public/uploads/" + img.filename);
    }
  }
};

const eliminarImagen = async (id) => {
  const juego = await JuegoModel.findById(id);
  const img = juego.imagen;
  fs.unlinkSync("./public/" + img);
};
