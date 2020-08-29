const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use((req, res, next) => {
    console.log(new Date(), req.method, req.url);
    next();
})

app.get("/logs", async (req,res) => {
    const logs = await pool.query('SELECT * FROM logs');
    res.json({ logs });
})

app.post("/logs", async (req,res) => {
    res.send("OK");
})

pool.connect();
app.listen(PORT, () => console.log(`App started on port ${PORT} 🚀`));