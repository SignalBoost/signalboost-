const cors = require('cors');
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",    // add your dev server port
  ]
}));
