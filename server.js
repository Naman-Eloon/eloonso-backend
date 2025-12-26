require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

/* Cloudinary config */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* Supabase config */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/* Multer (temp storage) */
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("E-LoonSo backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// 👇 sabse neeche paste karo

app.post("/upload/media", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "eloonso"
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/upload/file", upload.single("file"), async (req, res) => {
  const fs = require("fs");
  try {
    const buffer = fs.readFileSync(req.file.path);

    const { data, error } = await supabase.storage
      .from("models")
      .upload(req.file.originalname, buffer, {
        contentType: req.file.mimetype
      });

    if (error) throw error;

    res.json({ success: true, path: data.path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
