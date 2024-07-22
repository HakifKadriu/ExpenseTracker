const express = require("express");
// require('dotenv').config(); //Kta e perdorum kur e kem .env edhe dojm mi perdor nbaz tsaj portin, mongoUri etj..
const cors = require("cors");
const port = process.env.PORT || 5001;
const app = express();
const connectDB = require("./connectdb.js");

const mongoURI =
  "mongodb+srv://hakifkadriu:hakifkadriu@expensetracker.31h8d27.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseTracker";

const allowedOrigins = [
  "http://localhost:3000",
  "https://hakifkadriu.github.io",
  "https://expensetracker-nkp3.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

//Routes
const userRoutes = require("./Routes/user");
app.use("/user", userRoutes);
const expenseRoutes = require("./Routes/expense");
app.use("/expense", expenseRoutes);
const incomeRoutes = require("./Routes/income.js");
app.use("/income", incomeRoutes);

app.use(express.static("public"));

// app.get("/check-token", verifyToken /* Middleware*/, (req, res) => {
//   res.json(req.user);
// });

//Connecting to MongoDB
const start = async () => {
  try {
    await connectDB(mongoURI);
    console.log("Connected to DB");
    app
      .listen(port, () => {
        console.log(`Server is listening on port ${port}`);
      })
      .on("error", (err) => {
        console.error("Server error:", err.message);
      });
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};

start();
