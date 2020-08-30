const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { Pool } = require('pg')

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const PORT = process.env.PORT || 5000;

const protectedRoute = (req, res, next) => {
    const token = req.get('X-Token');
    if(!token || token !== process.env.API_TOKEN) {
        res.status(401).json({ error: true, message: 'Valid api token missing'});
        return;
    } 
    next();
}

app.use(helmet());
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

app.post("/logs", protectedRoute, async (req,res) => {
    const {temperature} = req.body;
    if(!temperature) {
        res.status(400).send({error: true, message:"temperature field is required"});
    }

    try {
        await pool.query('INSERT INTO logs(temperature, loggedAt) VALUES($1, $2) RETURNING *', [temperature, new Date()]);
        res.json({});
    } catch (error) {
        res.status(500).json({ error: true });
    }
})

const requiredKeys = ['DATABASE_URL', 'API_TOKEN'];
requiredKeys.forEach(key => {
    if(!process.env[key]) {
        throw `${key} not provided in environment variables. Aborting...`
    }
})

pool.connect();
app.listen(PORT, () => console.log(`App started on port ${PORT} 🚀`));