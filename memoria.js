const initSqlJs = require("sql.js");
const fs = require("fs");

let db;

async function iniciarMemoria(){

    const SQL = await initSqlJs();

    if(fs.existsSync("./memoria.db")){
        const archivo = fs.readFileSync("./memoria.db");
        db = new SQL.Database(archivo);
    } else {
        db = new SQL.Database();
    }

    db.run(`
    CREATE TABLE IF NOT EXISTS recuerdos(
        usuario TEXT,
        recuerdo TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);

    guardar();

    console.log("🧠 Memoria MONKEYBOT-V7 activada");

}


function guardar(){

    const data = db.export();

    fs.writeFileSync(
        "./memoria.db",
        Buffer.from(data)
    );

}


function guardarRecuerdo(usuario, recuerdo){

    db.run(
        "INSERT INTO recuerdos(usuario, recuerdo) VALUES (?,?)",
        [
            usuario,
            recuerdo
        ]
    );

    guardar();

}


function obtenerRecuerdos(usuario){

    const resultado = db.exec(
        "SELECT recuerdo FROM recuerdos WHERE usuario=? ORDER BY fecha DESC LIMIT 10",
        [usuario]
    );


    if(!resultado.length){
        return "";
    }


    return resultado[0].values
    .map(fila => fila[0])
    .join("\n");

}


module.exports = {
    iniciarMemoria,
    guardarRecuerdo,
    obtenerRecuerdos
};
