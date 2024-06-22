const express = require("express");
// require('dotenv').config(); //Kta e perdorum kur e kem .env edhe dojm mi perdor nbaz tsaj portin, mongoUri etj..
const cors = require("cors");
const port = process.env.PORT || 5001;
const app = express();
const connectDB = require("./connectdb.js");

const mongoURI =
  "mongodb+srv://hakifkadriu:hakifkadriu@expensetracker.31h8d27.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseTracker";

app.use(cors());
app.use(express.json());

//Routes
const userRoutes = require('./Routes/user');
app.use('/user', userRoutes);
const expenseRoutes = require('./Routes/expense');
app.use('/expense', expenseRoutes);


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
