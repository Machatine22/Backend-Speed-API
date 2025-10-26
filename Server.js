import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

const app = express();
app.use(cors());
app.use(express.json());

// === VEHICLES ===
app.get("/api/veiculos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM veiculos ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter veículos" });
  }
});

app.post("/api/veiculos", async (req, res) => {
  try {
    const { matricula, nome_proprietario, tipo_veiculo } = req.body;
    const result = await pool.query(
      "INSERT INTO veiculos (matricula, nome_proprietario, tipo_veiculo) VALUES ($1,$2,$3) RETURNING *",
      [matricula, nome_proprietario, tipo_veiculo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar veículo" });
  }
});

// === DETECTIONS ===
app.get("/api/deteccoes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM detecoes ORDER BY data_deteccao DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter detecções" });
  }
});

app.post("/api/deteccoes", async (req, res) => {
  try {
    const { matricula, url_imagem, confianca, localizacao, veiculo_id } = req.body;
    const result = await pool.query(
      "INSERT INTO detecoes (matricula, url_imagem, confianca, localizacao, veiculo_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [matricula, url_imagem, confianca, localizacao, veiculo_id || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar detecção' });
  }
});

// === ALERTS ===
app.get("/api/alertas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alertas ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao obter alertas" });
  }
});

app.post("/api/alertas", async (req, res) => {
  try {
    const { matricula, mensagem, criado_por, ativo } = req.body;
    const result = await pool.query(
      "INSERT INTO alertas (matricula, mensagem, criado_por, ativo) VALUES ($1,$2,$3,$4) RETURNING *",
      [matricula, mensagem, criado_por || null, ativo ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar alerta" });
  }
});

// Root endpoint
app.get("/", (req, res) => res.send("API running on Render 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
