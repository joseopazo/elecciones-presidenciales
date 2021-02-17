const { Pool } = require("pg");


const config = {
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "elecciones",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(config);

async function newPost(postObject) {
  const query = {
    text: 'INSERT INTO candidatos(nombre, foto, color, votos) VALUES ($1, $2, $3,0)RETURNING*;',
    values: [postObject.nombre, postObject.foto, postObject.color]

  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
}

async function indexPosts() {
  const query = {
    text: "SELECT * FROM candidatos",
  };

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(error);
  }
}

const eliminar = async (id) => {
  try {
    const result = await pool.query(
      `DELETE FROM candidatos WHERE id = '${id}' RETURNING *`
    );
    console.log(result.rowCount);
    return result.rowCount;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};


  const editCandidato = async (id) => {
    const query = {
      text: `UPDATE candidatos SET 
      nombre = $1,
      foto = $2,
      id = $3
      WHERE id = $3 RETURNING *` ,
      values: id,
    };

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error(error);
    }
  };

  async function transaccion(estado,votos,ganador) {
 
    const insertar = {
        text: 
        "Insert INTO historial(estado,votos,ganador) VALUES ($1, $2, $3) RETURNING*;",
        values: [estado,votos,ganador]
        
    }
 
    const aumentar = {
        text: "UPDATE candidatos SET votos = votos +$1 WHERE nombre = $2",
        
        values: [votos,ganador]
    }
    console.log(aumentar)
    try {
        await pool.query("BEGIN");
        const cons = await pool.query(insertar);
        const vot = await pool.query(aumentar);
        await pool.query("COMMIT");
        return true
    } catch (e) {
        console.log(e);
        await pool.query("ROLLBACK");
        return false
    }
}

async function historial() {
    const query = {
        text: 'SELECT * FROM historial',rowMode: "array",
    }

    try {
        const result = await pool.query(query)
        return result.rows
    } catch (error) {
        console.error(error)
    }
}

module.exports = { newPost, indexPosts, eliminar, editCandidato, transaccion, historial };
