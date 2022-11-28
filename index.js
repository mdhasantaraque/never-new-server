const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    app.get("/productDetails", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const result = await AllProductCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/productDetails", async (req, res) => {
      const details = req.body;
      const result = await AllProductCollection.insertOne(details);
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "6h",
        });
        return res.send({ accessToken: token });
      }
      res.status(401).send({ accessToken: "" });
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/cars", async (req, res) => {
      const query = { categories: "car" };
      const allCars = await AllProductCollection.find(query).toArray();
      res.send(allCars);
    });

    app.get("/bikes", async (req, res) => {
      const query = { categories: "bike" };
      const allBikes = await AllProductCollection.find(query).toArray();
      res.send(allBikes);
    });

    app.get("/vehicles", async (req, res) => {
      const query = { categories: "vehicle" };
      const allVehicles = await AllProductCollection.find(query).toArray();
      res.send(allVehicles);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/bookings/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          buyerName: user.buyerName,
          buyerEmail: user.buyerEmail,
          buyerPhone: user.buyerPhone,
          buyerMeetingPlace: user.buyerMeetingPlace,
          status: "booked",
        },
      };
      const result = await AllProductCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    app.delete("/users/admin/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/dashboard/myProducts/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await AllProductCollection.deleteOne(query);
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
