const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
// const getPing = require("./routes/pingRoute")
// const getUsers = require("./routes/userRoute");
const routes = require("./routes/index"); // using this no need to import different routes
const connectDB = require("./dbConnection");
connectDB();

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