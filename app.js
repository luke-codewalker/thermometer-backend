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
    try {
        const result = await pool.query('SELECT * FROM logs');
        const logs = result.rows;
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: true });
    }
})

app.post("/logs", async (req,res) => {
    const { body: data} = req;
    console.log("Received", data);
    
    res.send("OK");
})

pool.connect();
app.listen(PORT, () => console.log(`App started on port ${PORT} 🚀`));