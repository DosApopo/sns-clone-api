const express = require("express");
const app = express();
const authRoute = require("./routers/auth");
const postsRoute = require("./routers/posts");
const usersRoute = require("./routers/users");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const PORT = 5000;

const corsSetting = {
  origin: process.env.NEXT_PUBLIC_CLIENT_BASEURL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsSetting));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/users", usersRoute);

app.listen(PORT, () => console.log(`server is runnning on Port ${PORT}`));
