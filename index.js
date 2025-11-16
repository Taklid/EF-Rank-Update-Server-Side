// // ------------------ IMPORT ------------------
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

// // ------------------ CONFIG ------------------
// dotenv.config();
// const app = express();
// const port = process.env.PORT || 13000;

// // ------------------ MIDDLEWARE ------------------
// app.use(cors());
// app.use(express.json());

// // ------------------ MONGODB CONNECTION ------------------
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nndk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// // ------------------ MAIN FUNCTION ------------------
// async function run() {
//   try {
//     await client.connect();
//     console.log("✅ MongoDB Connected Successfully!");

//     // ------------------ DATABASE & COLLECTIONS ------------------
//     const db = client.db("Taklid-Food-Server");
//     const menuCollection = db.collection("menu-food");
//     const reviewsCollection = db.collection("reviews-food");
//     const matchCollection = db.collection("matches");
   

//     // ------------------ ROOT ROUTE ------------------
//     app.get("/", (req, res) => {
//       res.send("🚀 Taklid Food Server is Running Successfully!");
//     });

//     // ------------------ MENU ROUTES ------------------
//     app.get("/menu-food", async (req, res) => {
//       const foods = await menuCollection.find().toArray();
//       res.send(foods);
//     });

//     // ------------------ REVIEWS ROUTES ------------------
//     app.get("/reviews-food", async (req, res) => {
//       const reviews = await reviewsCollection.find().toArray();
//       res.send(reviews);
//     });

//     // ------------------ SCOREBOARD ROUTES ------------------

//     // ✅ Get all matches
//     app.get("/matches", async (req, res) => {
//       const matches = await matchCollection.find().sort({ _id: -1 }).toArray();
//       res.send(matches);
//     });

//     // ✅ Add a new match
//     app.post("/matches", async (req, res) => {
//       const match = req.body;
//       const result = await matchCollection.insertOne(match);
//       res.send(result);
//     });

//     // ✅ Delete a match (Handles both ObjectId & Custom ID)
//     app.delete("/matches/:id", async (req, res) => {
//       const id = req.params.id;

//       let query;
//       if (ObjectId.isValid(id)) {
//         query = { _id: new ObjectId(id) };
//       } else {
//         // In case you used numeric/string ID (like Date.now())
//         query = { _id: id }; 
//       }

//       const result = await matchCollection.deleteOne(query);

//       if (result.deletedCount === 0) {
//         return res.status(404).send({ message: "❌ Match not found" });
//       }

//       res.send({ message: "✅ Match deleted successfully", result });
//     });

//     // ✅ Update a match (Handles both ObjectId & Custom ID)
//     app.put("/matches/:id", async (req, res) => {
//       const id = req.params.id;
//       const updatedData = req.body;

//       let query;
//       if (ObjectId.isValid(id)) {
//         query = { _id: new ObjectId(id) };
//       } else {
//         query = { _id: id };
//       }

//       const result = await matchCollection.updateOne(query, { $set: updatedData });

//       if (result.matchedCount === 0) {
//         return res.status(404).send({ message: "❌ Match not found" });
//       }

//       res.send({ message: "✅ Match updated successfully", result });
//     });

//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//   }
// }





// // ------------------ RUN & SERVER LISTEN ------------------
// run().catch(console.dir);

// // ✅ Listen on 0.0.0.0 for Vercel compatibility
// app.listen(port, '0.0.0.0', () => {
//     console.log(`🚀 Server is running on port ${port}`);
// });




//  ----------------------update code------------------

// ------------------ IMPORT ------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

// ------------------ CONFIG ------------------
dotenv.config();
const app = express();
// Vercel handles the port, so PORT/app.listen is not strictly needed for the main export
// const port = process.env.PORT || 13000; 

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(express.json());

// ------------------ MONGODB CONNECTION ------------------
// Vercel will read DB_USER and DB_PASS from Environment Variables set in Vercel project settings
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nndk6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
 },
});

// A flag to ensure the connection is established only once
let isConnected = false;

// ------------------ MAIN FUNCTION - Connect to DB ------------------
async function connectToDatabase() {
  // Check if already connected to avoid re-connecting on every serverless function call
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection!");
    return client;
  }
  
  try {
    await client.connect();
    isConnected = true;
    console.log("✅ MongoDB Connected Successfully!");
    return client;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    // Vercel should be able to handle this error and fail the request
    throw new Error("Database connection failed"); 
  }
}

// ------------------ DATABASE & COLLECTIONS ------------------
// This setup allows the routes to get the collections after connection is confirmed

const db = client.db("Taklid-Food-Server");
const menuCollection = db.collection("menu-food");
const reviewsCollection = db.collection("reviews-food");
const matchCollection = db.collection("matches");
// 🌟 New Collection for Player/User Info (from SignUp form)
const playersCollection = db.collection("players");


// ------------------ ROUTES (Wrapped with connection logic if needed, but often Express handles it) ------------------

// Vercel Root Route: The root route is often handled differently, but this is fine.
app.get("/", (req, res) => {
  res.send("🚀 Taklid Food Server is Running Successfully!");
});

// Ensure DB connection is established before running any DB-dependent route
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        // Send a 500 if DB connection fails
        res.status(500).send({ message: "Internal Server Error: Database unavailable." });
    }
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

// ------------------ PLAYER INFO ROUTES (New Routes for SignUp Data) ------------------

// 🌟 POST /players: Save new player data from the SignUp form
app.post("/players", async (req, res) => {
    try {
        const player = req.body;
        
        // Ensure that necessary fields are present before inserting
        if (!player.email || !player.name) {
            return res.status(400).send({ message: "Missing required fields (email or name)." });
        }

        // Optional: Check if the player already exists using email or a unique ID (if provided)
        const existingPlayer = await playersCollection.findOne({ email: player.email });
        if (existingPlayer) {
            // If player exists, you might want to update or return a warning
             return res.status(409).send({ message: "Player with this email already exists." });
        }
        
        const result = await playersCollection.insertOne({
            ...player,
            // You might want to save the Firebase UID here if you pass it from the frontend
            createdAt: new Date(),
        });

        res.status(201).send({ message: "✅ Player data saved successfully!", insertedId: result.insertedId });
    } catch (error) {
        console.error("Error saving player data:", error);
        res.status(500).send({ message: "❌ Error saving player data to database." });
    }
});


// 🌟 GET /players: Get all player data (Used by PlayerInfo component to display all)
app.get("/players", async (req, res) => {
    try {
        const players = await playersCollection.find().sort({ name: 1 }).toArray();
        res.send(players);
    } catch (error) {
        res.status(500).send({ message: "Error fetching all player data.", error: error.message });
    }
});


// --- ✅ PUT Update Player (Edit Info) ---
    app.put("/players/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: updatedData.name,
            email: updatedData.email,
            phone: updatedData.phone,
            district: updatedData.district,
            bloodGroup: updatedData.bloodGroup,
            facebook: updatedData.facebook,
            photo: updatedData.photo,
            status: updatedData.status, // ✅ নতুন Status/Rank ফিল্ড
          },
        };

        const result = await playersCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Player not found" });
        }

        res.send({ message: "Player updated successfully", result });
      } catch (error) {
        console.error("PUT Error:", error);
        res.status(500).send({ message: "Failed to update player", error });
      }
    });


// 🌟 DELETE /players/:id: Delete a player (Used by PlayerInfo component)
app.delete("/players/:id", async (req, res) => {
    try {
        const id = req.params.id;

        let query;
        if (ObjectId.isValid(id)) {
            query = { _id: new ObjectId(id) };
        } else {
            // Allows deleting based on unique email or Firebase UID passed as 'id'
            query = { email: id }; 
            // OR if you save Firebase UID as a field: query = { uid: id }; 
        }

        const result = await playersCollection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "❌ Player not found" });
        }

        res.send({ message: "✅ Player deleted successfully", result });
    } catch (error) {
        res.status(500).send({ message: "Error deleting player.", error: error.message });
    }
});



// ------------------ VERCEL EXPORT ------------------
// This is the CRITICAL line for Vercel to recognize your Express app as a Serverless Function
export default app; 

// The following block is only for local development and is ignored by Vercel
// Vercel handles the Serverless function invocation and does not use app.listen
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 13000;
    app.listen(port, () => {
        console.log(`🚀 Server is running locally on port ${port}`);
    });
}


