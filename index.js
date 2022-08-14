require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const vu = require("valid-url");
const sid = require("shortid");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("Connected to DB")
);

// Schema
const urlSchema = mongoose.Schema({
  longUrl: {
    type: String,
    default: "",
    required: true,
  },
  shortUrl: {
    type: String,
    default: 0,
  },
  counter: {
    type: Number,
    default: 0,
  },
});
const Url = mongoose.model("Url", urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Solution endpoint
app.post("/api/shorturl", (req, res) => {
  const url = vu.isWebUri(req.body.url);

  if (url != undefined) {
    let id = sid.generate();

    let newUrl = new Url({
      longUrl: url,
      shortUrl: id,
    });
    newUrl.save(function (err, doc) {
      if (err) return console.error(err);
      res.json({
        original_url: newUrl.longUrl,
        short_url: newUrl.shortUrl,
      });
    });
  } else {
    res.json({ error: "invalid URL" });
  }
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  Url.findOne({ shortUrl: shortUrl }, (err, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.longUrl);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
