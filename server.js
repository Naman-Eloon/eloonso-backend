const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "eloonso_secret_key"; // baad me env variable banayenge

// TEMP DATABASE (abhi ke liye)
let users = [];

// SIGN UP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ msg: "All fields required" });

  const exists = users.find(u => u.email === email);
  if (exists)
    return res.status(400).json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    name,
    email,
    password: hashed,
    credits: 0
  });

  res.json({ msg: "Account created" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(400).json({ msg: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return res.status(401).json({ msg: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    name: user.name,
    credits: user.credits
  });
});

app.get("/", (req, res) => {
  res.send("E-LoonSo backend running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
