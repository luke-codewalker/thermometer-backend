const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require('cors');
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

const requiredBodyFields = (...keys) => (req, res, next) => {
    keys.forEach(key => {
        if(typeof req.body[key] === "undefined") {
            res.status(400).send({error: true, message: `${key} field in body is required but was missing`});
            return;
        }
    })
    next();
}

app.use(helmet());
app.use(cors());
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

app.get("/logs/latest", async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM logs ORDER BY logtime DESC LIMIT 1');
        const logs = result.rows;
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: true });
    }
})

app.post("/logs", protectedRoute, requiredBodyFields("temperature", "humidity", "pressure", "light"), async (req,res) => {
    const {temperature, humidity, pressure, light} = req.body;

    try {
        console.log(temperature, humidity, pressure, light)
        await pool.query('INSERT INTO logs(temperature, logTime, humidity, pressure, light) VALUES($1, $2, $2, $3, $4, $5) RETURNING *', [temperature, new Date(), humidity, pressure, light]);
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