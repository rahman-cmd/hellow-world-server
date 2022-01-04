const express = require("express");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");
const { signal } = require("nodemon/lib/config/defaults");
// const { get } = require("express/lib/response");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sx8wv.mongodb.net/algo-digital?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const main = async () => {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const database = client.db("hello-world");
    const usersCollection = database.collection("users");
    const postCollection = database.collection("posts");
    const storiesCollection = database.collection("stories");

    // APIs

    //get area

    //get user data
    app.get("/users", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { email: email };
      }

      const cursor = usersCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    // get a specific user
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.json(user);
    });

    //get post api
    app.get("/posts", async (req, res) => {
      const cursor = postCollection.find({});
      const posts = await cursor.toArray();
      res.send(posts);
    });

    // get a single post api
    app.get("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const post = await postCollection.findOne(query);
      res.send(post);
    });

    // get stories api
    app.get("/stories", async (req, res) => {
      const cursor = storiesCollection.find({});
      const stories = await cursor.toArray();
      res.send(stories);
    });

    //post area

    //post user data
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    //post user post data
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.json(result);
    });

    //post stories data

    app.post("/stories", async (req, res) => {
      let proImage = req.body?.proImage;
      let time = req.body?.time;
      let pic = req.files?.image;
      const picData = pic?.data;
      const encodedPic = picData?.toString("base64");
      const imageBuffer = Buffer?.from(encodedPic, "base64");

      const storyData = {
        proImage,
        time,
        image: imageBuffer,
      };
      const result = await storiesCollection.insertOne(storyData);
      res.json(result);
    });

    // upsert user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // delete data

    //delete a  post data
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.deleteOne(query);
      res.json(result);
    });
  } catch (err) {
    console.error(err);
  } finally {
    //   await client.close();
  }
};

main().catch((err) => console.dir);

app.get("/", (req, res) => {
  res.send("Hello World Server");
});

app.listen(port, () => {
  console.log(`Hello World Server listening at http://localhost:${port}`);
});
