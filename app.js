const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json())
app.use((req, res, next) => {
    console.log(new Date(), req.method, req.url);
    next();
})

app.get("/logs", (req,res) => {
    res.json([]);
})

app.post("/logs", (req,res) => {
    res.send("OK");
})

app.listen(PORT, () => console.log(`App started on port ${PORT} 🚀`));