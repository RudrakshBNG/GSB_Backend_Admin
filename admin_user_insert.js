// MongoDB Collection Insert Script for Super Admin User
// Copy and paste this into your MongoDB shell or use with mongoimport

// Option 1: Direct MongoDB Insert Query
// Run this in MongoDB Compass or MongoDB shell:

/*
db.admins.insertOne({
  "email": "admin@gsbpathy.com",
  "password": "gsbpathy123",
  "_id": ObjectId(),
  "__v": 0
})
*/

// Option 2: JSON document for mongoimport
// Save this as admin_user.json and run: mongoimport --db your_database --collection admins --file admin_user.json

const adminDocument = {
  email: "admin@gsbpathy.com",
  password: "gsbpathy123",
};

console.log("Admin document to insert:");
console.log(JSON.stringify(adminDocument, null, 2));

// Option 3: If you want a hashed password version
// First install bcrypt: npm install bcrypt
// Then run this script: node admin_user_insert.js

const bcrypt = require("bcrypt");

async function createHashedAdminDocument() {
  try {
    const hashedPassword = await bcrypt.hash("gsbpathy123", 10);

    const hashedAdminDocument = {
      email: "admin@gsbpathy.com",
      password: hashedPassword,
    };

    console.log("\nHashed admin document to insert:");
    console.log(JSON.stringify(hashedAdminDocument, null, 2));

    console.log("\nMongoDB insert command:");
    console.log(
      `db.admins.insertOne(${JSON.stringify(hashedAdminDocument, null, 2)})`
    );
  } catch (error) {
    console.error("Error creating hashed password:", error);
  }
}

// Uncomment the next line to generate hashed version
createHashedAdminDocument();

// ===== CURRENT LOGIN CREDENTIALS =====
console.log("\n🔑 CURRENT HARDCODED LOGIN CREDENTIALS:");
console.log("Email: admin@gsbpathy.com");
console.log("Password: gsbpathy123");
console.log("\nTry logging in with these credentials first!");
console.log(
  "The system currently uses hardcoded authentication, not database lookup."
);
