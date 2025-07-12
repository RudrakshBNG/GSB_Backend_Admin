const User = require("../models/User");
const Video = require("../models/Video");
const PDF = require("../models/PDF");
const Product = require("../models/Product");
const TeamMember = require("../models/TeamMember");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const DailyUpdate = require("../models/DailyUpdate");
const Story = require("../models/Story");
const Consultation = require("../models/Consultation");
const Order = require("../models/Order");

exports.addMockData = async (req, res) => {
  try {
    console.log("Adding mock data to database...");

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

    // Add mock videos
    await Video.insertMany([
      {
        title: "Morning Meditation for Beginners",
        description:
          "A peaceful 10-minute morning meditation session to start your day right.",
        category: "Meditation",
        accessLevel: "Free",
        youtubeLink: "https://youtube.com/watch?v=example1",
        thumbnailUrl: null,
      },
      {
        title: "Advanced Strength Training",
        description:
          "High-intensity strength training workout for experienced athletes.",
        category: "Fitness",
        accessLevel: "Paid",
        youtubeLink: "https://youtube.com/watch?v=example2",
        videoUrl: null,
      },
      {
        title: "Nutrition Basics",
        description:
          "Learn the fundamentals of proper nutrition for health and fitness.",
        category: "Education",
        accessLevel: "Free",
        youtubeLink: "https://youtube.com/watch?v=example3",
      },
      {
        title: "Success Story: 50kg Weight Loss",
        description: "Inspiring story of transformation and dedication.",
        category: "Success Stories",
        accessLevel: "Free",
        youtubeLink: "https://youtube.com/watch?v=example4",
      },
      {
        title: "Evening Relaxation",
        description: "Wind down with this calming evening meditation.",
        category: "Meditation",
        accessLevel: "Paid",
        youtubeLink: "https://youtube.com/watch?v=example5",
      },
    ]);

    // Add mock diet plans
    await PDF.insertMany([
      {
        title: "7-Day Weight Loss Diet Plan",
        description:
          "A comprehensive 7-day meal plan designed for healthy weight loss.",
        pdfUrl: null,
        thumbnailUrl: null,
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
      {
        fullName: "David Kumar",
        email: "david@gsbpathy.com",
        password: "gsbpathy123",
        department: "Marketing",
      },
    ]);

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
          {
            sender: "agent",
            text: "The best times are after workouts and before bed for optimal muscle recovery.",
          },
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
          {
            sender: "customer",
            text: "I want to lose weight and build some muscle.",
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
      {
        customerName: "Alice Brown",
        customerEmail: "alice@example.com",
        chatType: "feedback",
        messages: [
          {
            sender: "customer",
            text: "The app is great! Love the meditation videos.",
          },
          {
            sender: "agent",
            text: "Thank you so much for your positive feedback!",
          },
        ],
        status: "resolved",
      },
    ]);

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
        recipients: "Premium Users",
      },
      {
        title: "Weekly Progress Check",
        message: "Don't forget to log your weekly progress and measurements.",
        recipients: "All Users",
      },
    ]);

    // Add mock payments
    await Payment.insertMany([
      {
        user: mockUsers[0]._id,
        amount: 1999,
        paymentMethod: "UPI",
        transactionId: "TXN123456789",
        subscriptionType: "monthly",
        source: "app",
        paymentType: "subscription",
        status: "completed",
      },
      {
        user: mockUsers[1]._id,
        amount: 19999,
        paymentMethod: "Credit Card",
        transactionId: "TXN123456790",
        subscriptionType: "yearly",
        source: "web",
        paymentType: "subscription",
        status: "completed",
      },
      {
        user: mockUsers[2]._id,
        amount: 2999,
        paymentMethod: "Bank Transfer",
        transactionId: "TXN123456791",
        subscriptionType: "monthly",
        source: "manual",
        paymentType: "subscription",
        status: "completed",
      },
      {
        user: mockUsers[3]._id,
        amount: 2499,
        paymentMethod: "UPI",
        transactionId: "TXN123456792",
        subscriptionType: "monthly",
        source: "app",
        paymentType: "product",
        status: "completed",
        description: "Whey Protein Powder",
      },
      {
        user: mockUsers[4]._id,
        amount: 1599,
        paymentMethod: "Credit Card",
        transactionId: "TXN123456793",
        subscriptionType: "monthly",
        source: "web",
        paymentType: "product",
        status: "completed",
        description: "Premium Yoga Mat",
      },
      {
        user: mockUsers[0]._id,
        amount: 3299,
        paymentMethod: "Net Banking",
        transactionId: "TXN123456794",
        subscriptionType: "monthly",
        source: "web",
        paymentType: "product",
        status: "completed",
        description: "Mass Gainer Chocolate",
      },
    ]);

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
      {
        user: mockUsers[2]._id,
        title: "Post-Workout Meal",
        description:
          "Prepared a high-protein meal after my strength training session.",
        imageUrl: null,
      },
      {
        user: mockUsers[4]._id,
        title: "Weekly Progress Photo",
        description:
          "Seeing great improvements in my muscle definition after 6 weeks.",
        imageUrl: null,
      },
    ]);

    // Add mock user stories
    await Story.insertMany([
      {
        user: mockUsers[0]._id,
        title: "My 20kg Weight Loss Journey",
        description:
          "After 6 months of following GSB programs, I lost 20kg and gained confidence. The diet plans and workout videos were game changers for me.",
        beforeImageUrl: null,
        afterImageUrl: null,
      },
      {
        user: mockUsers[1]._id,
        title: "From Skinny to Strong",
        description:
          "I gained 15kg of lean muscle mass in 8 months. The nutrition guidance and workout plans helped me achieve my dream physique.",
        beforeImageUrl: null,
        afterImageUrl: null,
      },
      {
        user: mockUsers[3]._id,
        title: "Transformation After Pregnancy",
        description:
          "Lost 25kg post-pregnancy with GSB's safe and effective programs. Now I'm stronger than ever before!",
        beforeImageUrl: null,
        afterImageUrl: null,
      },
      {
        user: mockUsers[4]._id,
        title: "Overcoming Lifestyle Diseases",
        description:
          "Reversed my diabetes and high blood pressure through proper diet and exercise. GSB saved my life!",
        beforeImageUrl: null,
        afterImageUrl: null,
      },
    ]);

    // Add mock consultations
    await Consultation.insertMany([
      {
        firstName: "Rahul",
        lastName: "Sharma",
        email: "rahul.sharma@example.com",
        phoneNumber: "+919876543220",
        message:
          "I want to lose 15kg in 4 months. What diet and exercise plan would you recommend?",
        status: "pending",
        assignedTo: mockTeamMembers[0]._id,
      },
      {
        firstName: "Anita",
        lastName: "Patel",
        email: "anita.patel@example.com",
        phoneNumber: "+919876543221",
        message:
          "I'm a beginner and want to start my fitness journey. Need guidance on where to start.",
        status: "in-progress",
        assignedTo: mockTeamMembers[1]._id,
      },
      {
        firstName: "Sanjay",
        lastName: "Kumar",
        email: "sanjay.kumar@example.com",
        phoneNumber: "+919876543222",
        message:
          "I have diabetes and high blood pressure. Can you help me with a safe workout routine?",
        status: "completed",
        assignedTo: mockTeamMembers[0]._id,
      },
      {
        firstName: "Priya",
        lastName: "Reddy",
        email: "priya.reddy@example.com",
        phoneNumber: "+919876543223",
        message:
          "I want to build muscle mass. I'm currently 55kg and want to reach 65kg.",
        status: "pending",
      },
      {
        firstName: "Amit",
        lastName: "Singh",
        email: "amit.singh@example.com",
        phoneNumber: "+919876543224",
        message:
          "Post-pregnancy weight loss guidance needed. I gained 20kg during pregnancy.",
        status: "in-progress",
        assignedTo: mockTeamMembers[2]._id,
      },
    ]);

    // Add mock orders
    await Order.insertMany([
      {
        userId: mockUsers[0]._id,
        items: [
          {
            productId: "whey-protein-001",
            name: "Whey Protein Powder",
            price: 2499,
            quantity: 2,
          },
          {
            productId: "multivitamin-001",
            name: "Multivitamin Tablets",
            price: 1499,
            quantity: 1,
          },
        ],
        contactInfo: {
          name: "Raj Patel",
          phone: "+919876543210",
          address: "123 MG Road, Mumbai, Maharashtra 400001",
        },
        paymentMethod: "UPI",
        total: 6497,
        status: "delivered",
      },
      {
        userId: mockUsers[1]._id,
        items: [
          {
            productId: "bcaa-001",
            name: "BCAA Energy Drink",
            price: 1999,
            quantity: 3,
          },
        ],
        contactInfo: {
          name: "Priya Sharma",
          phone: "+919876543211",
          address: "456 Park Street, Kolkata, West Bengal 700016",
        },
        paymentMethod: "Credit Card",
        total: 5997,
        status: "shipped",
      },
      {
        userId: mockUsers[2]._id,
        items: [
          {
            productId: "omega3-001",
            name: "Omega-3 Fish Oil",
            price: 1799,
            quantity: 1,
          },
          {
            productId: "whey-protein-001",
            name: "Whey Protein Powder",
            price: 2499,
            quantity: 1,
          },
        ],
        contactInfo: {
          name: "Arjun Singh",
          phone: "+919876543212",
          address: "789 Brigade Road, Bangalore, Karnataka 560025",
        },
        paymentMethod: "Bank Transfer",
        total: 4298,
        status: "pending",
      },
      {
        userId: mockUsers[3]._id,
        items: [
          {
            productId: "multivitamin-001",
            name: "Multivitamin Tablets",
            price: 1499,
            quantity: 2,
          },
        ],
        contactInfo: {
          name: "Neha Gupta",
          phone: "+919876543213",
          address: "321 CP Market, New Delhi, Delhi 110001",
        },
        paymentMethod: "UPI",
        total: 2998,
        status: "delivered",
      },
      {
        userId: mockUsers[4]._id,
        items: [
          {
            productId: "whey-protein-001",
            name: "Whey Protein Powder",
            price: 2499,
            quantity: 1,
          },
          {
            productId: "bcaa-001",
            name: "BCAA Energy Drink",
            price: 1999,
            quantity: 2,
          },
          {
            productId: "omega3-001",
            name: "Omega-3 Fish Oil",
            price: 1799,
            quantity: 1,
          },
        ],
        contactInfo: {
          name: "Vikram Yadav",
          phone: "+919876543214",
          address: "654 FC Road, Pune, Maharashtra 411005",
        },
        paymentMethod: "Credit Card",
        total: 8296,
        status: "shipped",
      },
      {
        userId: mockUsers[0]._id,
        items: [
          {
            productId: "pre-workout-001",
            name: "Pre-Workout Energy Boost",
            price: 2799,
            quantity: 1,
          },
          {
            productId: "protein-bar-001",
            name: "Protein Energy Bars (Pack of 12)",
            price: 1299,
            quantity: 2,
          },
        ],
        contactInfo: {
          name: "Raj Patel",
          phone: "+919876543210",
          address: "123 MG Road, Mumbai, Maharashtra 400001",
        },
        paymentMethod: "Net Banking",
        total: 5397,
        status: "delivered",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: mockUsers[2]._id,
        items: [
          {
            productId: "mass-gainer-001",
            name: "Mass Gainer Chocolate",
            price: 3299,
            quantity: 1,
          },
        ],
        contactInfo: {
          name: "Arjun Singh",
          phone: "+919876543212",
          address: "789 Brigade Road, Bangalore, Karnataka 560025",
        },
        paymentMethod: "UPI",
        total: 3299,
        status: "pending",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: mockUsers[3]._id,
        items: [
          {
            productId: "yoga-mat-001",
            name: "Premium Yoga Mat",
            price: 1599,
            quantity: 1,
          },
          {
            productId: "resistance-bands-001",
            name: "Resistance Bands Set",
            price: 899,
            quantity: 1,
          },
          {
            productId: "water-bottle-001",
            name: "Steel Water Bottle 1L",
            price: 699,
            quantity: 2,
          },
        ],
        contactInfo: {
          name: "Neha Gupta",
          phone: "+919876543213",
          address: "321 CP Market, New Delhi, Delhi 110001",
        },
        paymentMethod: "Credit Card",
        total: 3896,
        status: "shipped",
        createdAt: new Date(), // Today
      },
    ]);

    res.status(200).json({
      message: "Mock data added successfully!",
      data: {
        users: mockUsers.length,
        videos: 5,
        dietPlans: 4,
        products: 4,
        teamMembers: mockTeamMembers.length,
        chats: 4,
        notifications: 4,
        payments: 3,
        dailyUpdates: 5,
        stories: 4,
        consultations: 5,
        orders: 5,
      },
    });
  } catch (error) {
    console.error("Error adding mock data:", error);
    res.status(500).json({
      message: "Error adding mock data",
      error: error.message,
    });
  }
};
