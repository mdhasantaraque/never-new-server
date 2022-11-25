const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zlgr27w.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productCollection = client
      .db("neverNew")
      .collection("productOptions");
    const AllProductCollection = client
      .db("neverNew")
      .collection("productDetails");
    const usersCollection = client.db("neverNew").collection("users");

    app.get("/productOptions", async (req, res) => {
      const query = {};
      const products = await productCollection.find(query).toArray();
      res.send(products);
    });
    app.get("/productDetails", async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;

      // if (email !== decodedEmail) {
      //     return res.status(403).send({ message: 'forbidden access' });
      // }

      const query = { email: email };
      const result = await AllProductCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/productDetails", async (req, res) => {
      const details = req.body;
      const result = await AllProductCollection.insertOne(details);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}

run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("NN server is running");
});
app.listen(port, () => {
  console.log(`NN server is running port,${port}`);
});
