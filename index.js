const express = require("express");
const app = express();
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit")
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100});
const helmet = require("helmet")
const cors = require('cors')
dotenv.config();
app.use(express.json());
// const getPing = require("./routes/pingRoute")
// const getUsers = require("./routes/userRoute");
const routes = require("./routes/index"); // using this no need to import different routes
const connectDB = require("./dbConnection");
connectDB();


app.use(mongoSanitize());
app.use(xss())
app.use(limiter)
app.use(helmet())
app.use(cors({origin: "*"})) //* for global access

app.get("/", (req, res) => {
    res.send("API is working!");
});

app.use("/api", routes);


app.use((error, req, res, next) => {
    res.status(500).json({ error: error.message });
})


app.listen(3000, () => {
    console.log("Server running on port 3000");
})