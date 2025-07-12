require("dotenv").config();
const mongoose = require("mongoose");

// Import all models
const User = require("./models/User");
const Video = require("./models/Video");
const PDF = require("./models/PDF");
const Product = require("./models/Product");
const TeamMember = require("./models/TeamMember");
const Chat = require("./models/Chat");
const Notification = require("./models/Notification");
const Payment = require("./models/Payment");
const DailyUpdate = require("./models/DailyUpdate");

async function addMockData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Video.deleteMany({});
    // await PDF.deleteMany({});
    // await Product.deleteMany({});
    // await TeamMember.deleteMany({});
    // await Chat.deleteMany({});
    // await Notification.deleteMany({});
    // await Payment.deleteMany({});
    // await DailyUpdate.deleteMany({});

    // Add mock users
    const mockUsers = await User.insertMany([
      {
        fullName: "Raj Patel",
        phoneNumber: "+919876543210",
        age: 28,
        weight: 75,
        height: 175,
        goal: "Weight Loss",
        score: 85,
        flag: "green",
      },
      {
        fullName: "Priya Sharma",
        phoneNumber: "+919876543211",
        age: 25,
        weight: 60,
        height: 165,
        goal: "Muscle Gain",
        score: 65,
        flag: "yellow",
      },
      {
        fullName: "Arjun Singh",
        phoneNumber: "+919876543212",
        age: 32,
        weight: 80,
        height: 180,
        goal: "General Fitness",
        score: 40,
        flag: "red",
      },
      {
        fullName: "Neha Gupta",
        phoneNumber: "+919876543213",
        age: 29,
        weight: 55,
        height: 160,
        goal: "Weight Loss",
        score: 90,
        flag: "green",
      },
      {
        fullName: "Vikram Yadav",
        phoneNumber: "+919876543214",
        age: 35,
        weight: 85,
        height: 178,
        goal: "Muscle Gain",
        score: 55,
        flag: "yellow",
      },
    ]);
    console.log("✅ Added mock users");

    // Add mock videos
    // await Video.insertMany([
    //   {
    //     title: "Morning Meditation for Beginners",
    //     description:
    //       "A peaceful 10-minute morning meditation session to start your day right.",
    //     category: "Meditation",
    //     accessLevel: "Free",
    //     youtubeLink: "https://youtube.com/watch?v=example1",
    //   },
    //   {
    //     title: "Advanced Strength Training",
    //     description:
    //       "High-intensity strength training workout for experienced athletes.",
    //     category: "Fitness",
    //     accessLevel: "Paid",
    //     youtubeLink: "https://youtube.com/watch?v=example2",
    //   },
    //   {
    //     title: "Nutrition Basics",
    //     description:
    //       "Learn the fundamentals of proper nutrition for health and fitness.",
    //     category: "Education",
    //     accessLevel: "Free",
    //     youtubeLink: "https://youtube.com/watch?v=example3",
    //   },
    //   {
    //     title: "Success Story: 50kg Weight Loss",
    //     description: "Inspiring story of transformation and dedication.",
    //     category: "Success Stories",
    //     accessLevel: "Free",
    //     youtubeLink: "https://youtube.com/watch?v=example4",
    //   },
    //   {
    //     title: "Evening Relaxation",
    //     description: "Wind down with this calming evening meditation.",
    //     category: "Meditation",
    //     accessLevel: "Paid",
    //     youtubeLink: "https://youtube.com/watch?v=example5",
    //   },
    // ]);
    // console.log("✅ Added mock videos");

    // Add mock diet plans
    await PDF.insertMany([
      {
        title: "7-Day Weight Loss Diet Plan",
        description:
          "A comprehensive 7-day meal plan designed for healthy weight loss.",
        pdfUrl: null,
      },
      {
        title: "Muscle Building Nutrition Guide",
        description:
          "Complete nutrition guide for muscle building and strength training.",
        pdfUrl: null,
      },
      {
        title: "Vegetarian Fitness Diet",
        description: "Plant-based diet plan for fitness enthusiasts.",
        pdfUrl: null,
      },
      {
        title: "Post-Workout Recovery Meals",
        description:
          "Optimal meals for post-workout recovery and muscle repair.",
        pdfUrl: null,
      },
    ]);
    console.log("✅ Added mock diet plans");

    // Add mock products
    await Product.insertMany([
      {
        name: "Whey Protein Powder",
        description:
          "High-quality whey protein for muscle building and recovery.",
        price: 2999,
        salePrice: 2499,
        stock: 50,
        imageUrl: null,
        ingredients: ["Whey Protein Isolate", "Natural Flavors", "Stevia"],
        benefits: ["Muscle Building", "Quick Recovery", "High Protein"],
        status: "In Stock",
      },
      {
        name: "Multivitamin Tablets",
        description: "Complete multivitamin supplement for daily nutrition.",
        price: 1499,
        stock: 25,
        imageUrl: null,
        ingredients: ["Vitamin A", "Vitamin C", "Vitamin D", "Minerals"],
        benefits: ["Immune Support", "Energy Boost", "Overall Health"],
        status: "In Stock",
      },
      {
        name: "BCAA Energy Drink",
        description:
          "Branched-chain amino acids for workout energy and recovery.",
        price: 1999,
        stock: 8,
        imageUrl: null,
        ingredients: ["L-Leucine", "L-Isoleucine", "L-Valine", "Caffeine"],
        benefits: ["Energy Boost", "Muscle Recovery", "Endurance"],
        status: "Low Stock",
      },
      {
        name: "Omega-3 Fish Oil",
        description:
          "High-potency omega-3 fatty acids for heart and brain health.",
        price: 1799,
        stock: 0,
        imageUrl: null,
        ingredients: ["Fish Oil", "EPA", "DHA", "Vitamin E"],
        benefits: ["Heart Health", "Brain Function", "Anti-inflammatory"],
        status: "Out of Stock",
      },
    ]);
    console.log("✅ Added mock products");

    // Add mock team members
    const mockTeamMembers = await TeamMember.insertMany([
      {
        fullName: "Sarah Johnson",
        email: "sarah@gsbpathy.com",
        password: "gsbpathy123",
        department: "Customer Support",
      },
      {
        fullName: "Mike Chen",
        email: "mike@gsbpathy.com",
        password: "gsbpathy123",
        department: "Technical Support",
      },
      {
        fullName: "Lisa Rodriguez",
        email: "lisa@gsbpathy.com",
        password: "gsbpathy123",
        department: "Sales",
      },
    ]);
    console.log("✅ Added mock team members");

    // Add mock chats
    await Chat.insertMany([
      {
        customerName: "John Doe",
        customerEmail: "john@example.com",
        chatType: "product_support",
        messages: [
          {
            sender: "customer",
            text: "Hi, I have a question about the whey protein.",
          },
          {
            sender: "agent",
            text: "Hello! I'd be happy to help. What would you like to know?",
          },
          { sender: "customer", text: "What's the best time to take it?" },
        ],
        status: "open",
        assignedTo: mockTeamMembers[0]._id,
      },
      {
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        chatType: "consultancy",
        messages: [
          { sender: "customer", text: "I need help creating a workout plan." },
          {
            sender: "agent",
            text: "I can definitely help you with that. What are your fitness goals?",
          },
        ],
        status: "open",
        assignedTo: mockTeamMembers[1]._id,
      },
      {
        customerName: "Bob Wilson",
        customerEmail: "bob@example.com",
        chatType: "general",
        messages: [
          { sender: "customer", text: "How do I access premium videos?" },
          {
            sender: "agent",
            text: "You need to subscribe to our premium plan.",
          },
          { sender: "customer", text: "Thanks for the help!" },
        ],
        status: "resolved",
      },
    ]);
    console.log("✅ Added mock chats");

    // Add mock notifications
    await Notification.insertMany([
      {
        title: "Welcome to GSB Fitness!",
        message: "Start your fitness journey with our comprehensive programs.",
        recipients: "All Users",
      },
      {
        title: "New Video Added",
        message: "Check out our latest meditation video for stress relief.",
        recipients: "All Users",
      },
      {
        title: "Product Sale Alert",
        message: "Get 20% off on all protein supplements this week!",
        recipients: "All Users",
      },
    ]);
    console.log("✅ Added mock notifications");

    // Add mock payments
    await Payment.insertMany([
      {
        user: mockUsers[0]._id,
        amount: 1999,
        paymentMethod: "UPI",
        transactionId: "TXN123456789",
        subscriptionType: "monthly",
        source: "app",
        status: "completed",
      },
      {
        user: mockUsers[1]._id,
        amount: 19999,
        paymentMethod: "Credit Card",
        transactionId: "TXN123456790",
        subscriptionType: "yearly",
        source: "web",
        status: "completed",
      },
      {
        user: mockUsers[2]._id,
        amount: 2999,
        paymentMethod: "Bank Transfer",
        transactionId: "TXN123456791",
        subscriptionType: "monthly",
        source: "manual",
        status: "completed",
      },
    ]);
    console.log("✅ Added mock payments");

    // Add mock daily updates
    await DailyUpdate.insertMany([
      {
        user: mockUsers[0]._id,
        title: "Morning Workout Complete",
        description: "Completed 45 minutes of cardio and strength training.",
        imageUrl: null,
      },
      {
        user: mockUsers[1]._id,
        title: "Healthy Breakfast",
        description: "Started the day with oats, fruits, and protein shake.",
        imageUrl: null,
      },
      {
        user: mockUsers[3]._id,
        title: "Evening Yoga Session",
        description: "Relaxing yoga session to end the day peacefully.",
        imageUrl: null,
      },
    ]);
    console.log("✅ Added mock daily updates");

    console.log("🎉 All mock data added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding mock data:", error);
    process.exit(1);
  }
}

// Run the function
addMockData();
