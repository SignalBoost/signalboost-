const express = require("express");
const app = express();

const feedRoutes = require("./api/feedServer"); // adjust path if needed
app.use("/api", feedRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
