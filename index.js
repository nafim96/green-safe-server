const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();
const cors = require("cors");
const app = express();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@greenbd.rdjoa.mongodb.net/${process.env.DB_DATA_BASE}?retryWrites=true&w=majority`;
const port = 5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log(err);
  const treeCollection = client
    .db(`${process.env.DB_DATA_BASE}`)
    .collection(`${process.env.DB_CL_NAME}`);


    const orderCollection = client
    .db(`${process.env.DB_DATA_BASE}`)
    .collection(`${process.env.DB_CL_ORDER}`);


  app.post("/addTree", (req, res) => {
    const newEvent = req.body;
    console.log("get event", newEvent);
    treeCollection.insertOne(newEvent).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/trees", (req, res) => {
    treeCollection.find().toArray((err, items) => {
      console.log("get items from data base", items);
      res.send(items);
    });
  });

  app.get("/checkOut/:id", (req, res) => {
    treeCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
        console.log(documents[0]);
      });
  });

  app.post("/productsByKeys", (req, res) => {
    const productKeys = req.body;
    treeCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.delete("/deleteTree/:id", ( req,res) => {
    console.log(req.params.id);
    treeCollection
      .findOneAndDelete({ _id: ObjectId(req.params.id) })
      .then((err, documents) => {
        res.send(!!documents.value);
        console.log(err);
      });
  });


  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getOrder", (req, res) => {
    orderCollection.find().toArray((err, items) => {
      console.log("get items from data base", items);
      res.send(items);
    });
  });
});

app.listen(process.env.PORT || port);
