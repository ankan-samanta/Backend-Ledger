const express = require("express");
const app = express();
/* require routes */
const authRouter = require("./routers/auth.routes");
const accountRouter = require("../src/routers/account.routes");
const transactionRoutes = require("../src/routers/transection.routes");

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/* use routes */
app.use("/",(req,res)=>{
    res.send("ledger service is up and running")
})

app.use("/api/auth",authRouter);
app.use("/api/account",accountRouter);
app.use("/api/transaction",transactionRoutes);

module.exports = app;