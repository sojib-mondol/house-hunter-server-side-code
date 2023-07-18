const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zmcxwrx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
console.log(uri);

async function run() {
  // Connect to MongoDB && collection 
  await client.connect();
  const db = client.db("house-hunter");
  const usersCollection = db.collection("users");

  // Register endpoint
  app.post("/register", async (req, res) => {
    try {
      const { fullName, role, phoneNumber, email, password } = req.body;

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user object
      const newUser = {
        fullName,
        role,
        phoneNumber,
        email,
        password: hashedPassword,
      };
      // Save the user to the database
      const result = await usersCollection.insertOne(newUser);
      // Generate a JWT token
      const token = jwt.sign({ userId: result.insertedId }, "your-secret-key");
      // Return the token to the client
      res.json({ token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("House Hunter server is running");
});
app.listen(port, () => console.log(`House Hunter server running on ${port}`));
