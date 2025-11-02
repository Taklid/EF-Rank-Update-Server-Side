// ------------------ IMPORT ------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

// ------------------ CONFIG ------------------
dotenv.config();
const app = express();
const port = process.env.PORT || 13000;

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(express.json());

// ------------------ MONGODB CONNECTION ------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nndk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ------------------ MAIN FUNCTION ------------------
async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully!");

    // ------------------ DATABASE & COLLECTIONS ------------------
    const db = client.db("Taklid-Food-Server");
    const menuCollection = db.collection("menu-food");
    const reviewsCollection = db.collection("reviews-food");
    const matchCollection = db.collection("matches");
   

    // ------------------ ROOT ROUTE ------------------
    app.get("/", (req, res) => {
      res.send("🚀 Taklid Food Server is Running Successfully!");
    });

    // ------------------ MENU ROUTES ------------------
    app.get("/menu-food", async (req, res) => {
      const foods = await menuCollection.find().toArray();
      res.send(foods);
    });

    // ------------------ REVIEWS ROUTES ------------------
    app.get("/reviews-food", async (req, res) => {
      const reviews = await reviewsCollection.find().toArray();
      res.send(reviews);
    });

    // ------------------ SCOREBOARD ROUTES ------------------

    // ✅ Get all matches
    app.get("/matches", async (req, res) => {
      const matches = await matchCollection.find().sort({ _id: -1 }).toArray();
      res.send(matches);
    });

    // ✅ Add a new match
    app.post("/matches", async (req, res) => {
      const match = req.body;
      const result = await matchCollection.insertOne(match);
      res.send(result);
    });

    // ✅ Delete a match (Handles both ObjectId & Custom ID)
    app.delete("/matches/:id", async (req, res) => {
      const id = req.params.id;

      let query;
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        // In case you used numeric/string ID (like Date.now())
        query = { _id: id }; 
      }

      const result = await matchCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "❌ Match not found" });
      }

      res.send({ message: "✅ Match deleted successfully", result });
    });

    // ✅ Update a match (Handles both ObjectId & Custom ID)
    app.put("/matches/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      let query;
      if (ObjectId.isValid(id)) {
        query = { _id: new ObjectId(id) };
      } else {
        query = { _id: id };
      }

      const result = await matchCollection.updateOne(query, { $set: updatedData });

      if (result.matchedCount === 0) {
        return res.status(404).send({ message: "❌ Match not found" });
      }

      res.send({ message: "✅ Match updated successfully", result });
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}





// ------------------ RUN & SERVER LISTEN ------------------
run().catch(console.dir);

app.listen(port, () => {
  console.log(`🔥 Server is running on port: ${port}`);
});




