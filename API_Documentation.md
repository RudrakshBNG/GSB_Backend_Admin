# GSB Admin API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📊 Postman Collection

Import the `GSB_Admin_API_Collection.postman_collection.json` file into Postman to test all APIs easily.

---

## 🔐 Authentication Endpoints

### POST /auth/login

**Description:** Admin login  
**Body:**

```json
{
  "email": "admin@gsbpathy.com",
  "password": "gsbpathy123"
}
```

### GET /auth/verify

**Description:** Verify JWT token  
**Headers:** `Authorization: Bearer <token>`

---

## 👥 User Management

### GET /user

**Description:** Get all users  
**Response:** Array of user objects

### GET /user/:userId

**Description:** Get specific user by ID

### PUT /user/:userId

**Description:** Update user information  
**Body:**

```json
{
  "fullName": "Updated Name",
  "age": 30,
  "weight": 70,
  "height": 175,
  "goal": "Weight Loss",
  "score": 85,
  "flag": "green"
}
```

---

## 📖 User Stories

### GET /stories

**Description:** Get all user transformation stories  
**Response:**

```json
{
  "message": "Stories fetched successfully",
  "stories": [
    {
      "_id": "story_id",
      "user": {
        "fullName": "User Name",
        "email": "user@example.com"
      },
      "title": "My Transformation Story",
      "description": "Story description",
      "beforeImageUrl": "image_url",
      "afterImageUrl": "image_url",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /stories

**Description:** Add new user story  
**Content-Type:** `multipart/form-data`  
**Body:**

- `title` (text): Story title
- `description` (text): Story description
- `beforeImage` (file): Before transformation image
- `afterImage` (file): After transformation image

---

## 🩺 Consultations

### GET /consultancy/all

**Description:** Get all consultation requests  
**Response:**

```json
{
  "message": "Fetched consultancy requests",
  "count": 5,
  "data": [
    {
      "_id": "consultation_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210",
      "message": "I need help with weight loss",
      "status": "pending",
      "assignedTo": {
        "fullName": "Team Member",
        "email": "team@gsbpathy.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /consultancy/:id

**Description:** Get specific consultation by ID

### POST /consultancy/submit

**Description:** Submit new consultation request  
**Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "message": "I need help with my fitness goals"
}
```

### PATCH /consultancy/:id

**Description:** Update consultation status  
**Body:**

```json
{
  "status": "in-progress",
  "assignedTo": "team_member_id"
}
```

---

## 🛒 Orders Management

### GET /orders

**Description:** Get all orders  
**Response:**

```json
{
  "message": "All orders fetched",
  "orders": [
    {
      "_id": "order_id",
      "userId": {
        "fullName": "Customer Name",
        "email": "customer@example.com"
      },
      "items": [
        {
          "productId": "product_id",
          "name": "Product Name",
          "price": 2999,
          "quantity": 1
        }
      ],
      "contactInfo": {
        "name": "Customer Name",
        "phone": "+919876543210",
        "address": "Full Address"
      },
      "paymentMethod": "UPI",
      "total": 2999,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /orders/user/:userId

**Description:** Get orders for specific user

### POST /orders/place-order

**Description:** Place new order  
**Body:**

```json
{
  "userId": "user_id",
  "contactInfo": {
    "name": "Customer Name",
    "phone": "+919876543210",
    "address": "Full Address"
  },
  "paymentMethod": "Credit Card"
}
```

---

## 📅 Daily Updates

### GET /daily-updates

**Description:** Get all daily updates  
**Response:**

```json
{
  "message": "Daily updates fetched successfully",
  "dailyUpdates": [
    {
      "_id": "update_id",
      "user": {
        "fullName": "User Name",
        "email": "user@example.com"
      },
      "title": "Workout Complete",
      "description": "Completed morning workout",
      "imageUrl": "image_url",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /daily-updates

**Description:** Add new daily update  
**Content-Type:** `multipart/form-data`  
**Body:**

- `title` (text): Update title
- `description` (text): Update description
- `image` (file): Update image

---

## 💳 Payments

### GET /payments

**Description:** Get all payment records  
**Response:**

```json
{
  "payments": [
    {
      "_id": "payment_id",
      "user": {
        "fullName": "User Name",
        "email": "user@example.com"
      },
      "amount": 1999,
      "paymentMethod": "UPI",
      "transactionId": "TXN123456789",
      "subscriptionType": "monthly",
      "source": "app",
      "status": "completed",
      "paymentDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /payments/analytics

**Description:** Get payment analytics and statistics

---

## 📦 Products

### GET /products

**Description:** Get all products

### GET /products/:id

**Description:** Get specific product by ID

### POST /products

**Description:** Add new product  
**Content-Type:** `multipart/form-data`  
**Body:**

- `name` (text): Product name
- `description` (text): Product description
- `price` (text): Product price
- `stock` (text): Stock quantity
- `ingredients` (text): JSON array of ingredients
- `benefits` (text): JSON array of benefits
- `image` (file): Product image

---

## 🎥 Videos

### GET /videos

**Description:** Get all videos

### GET /videos/:id

**Description:** Get specific video by ID

### POST /videos

**Description:** Add new video  
**Content-Type:** `multipart/form-data`  
**Body:**

- `title` (text): Video title
- `description` (text): Video description
- `category` (text): Video category
- `accessLevel` (text): "Free" or "Paid"
- `youtubeLink` (text): YouTube link (optional)
- `video` (file): Video file (optional)
- `thumbnail` (file): Thumbnail image (optional)

---

## 📄 Diet Plans (PDFs)

### GET /dietplans

**Description:** Get all diet plans

### GET /dietplans/:id

**Description:** Get specific diet plan by ID

### POST /dietplans

**Description:** Add new diet plan  
**Content-Type:** `multipart/form-data`  
**Body:**

- `title` (text): Plan title
- `description` (text): Plan description
- `pdf` (file): PDF file
- `thumbnail` (file): Thumbnail image (optional)

---

## 👨‍💼 Team Management

### GET /teams

**Description:** Get all team members

### POST /teams

**Description:** Add new team member  
**Body:**

```json
{
  "fullName": "Team Member Name",
  "email": "member@gsbpathy.com",
  "password": "password123",
  "department": "Customer Support"
}
```

---

## 💬 Chat Management

### GET /chat

**Description:** Get all chat conversations

### GET /chat/:chatId

**Description:** Get specific chat by ID

### POST /chat/send

**Description:** Send message in chat  
**Body:**

```json
{
  "chatId": "chat_id",
  "sender": "agent",
  "text": "Hello! How can I help you?"
}
```

---

## 🔔 Notifications

### GET /notifications

**Description:** Get all notifications

### POST /notifications

**Description:** Send new notification  
**Body:**

```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "recipients": "All Users"
}
```

---

## 🛍️ Cart Management

### GET /cart/:userId

**Description:** Get user's cart

### POST /cart/add

**Description:** Add item to cart  
**Body:**

```json
{
  "userId": "user_id",
  "productId": "product_id",
  "name": "Product Name",
  "price": 2999,
  "quantity": 1
}
```

---

## 🔧 Utility Endpoints

### GET /health

**Description:** API health check  
**Response:**

```json
{
  "status": "server_running",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /mock/add-mock-data

**Description:** Add mock data to database for testing

---

## 📝 Error Handling

All endpoints return standardized error responses:

**Success Response (200/201):**

```json
{
  "message": "Success message",
  "data": {}
}
```

**Error Response (400/500):**

```json
{
  "message": "Error message",
  "error": "Detailed error description"
}
```

---

## 🚀 Getting Started

1. **Import Postman Collection:** Import `GSB_Admin_API_Collection.postman_collection.json`
2. **Set Environment Variables:** Set `baseUrl` to `http://localhost:3000`
3. **Login:** Use the admin login endpoint to get authentication token
4. **Test APIs:** All endpoints are ready to test with sample data

---

## 📊 Sample Data Available

The mock data includes:

- **5 Users** with different goals and fitness levels
- **4 User Stories** with before/after transformations
- **5 Consultation Requests** in various states
- **5 Orders** with different products and statuses
- **5 Daily Updates** from various users
- **3 Payment Records** for subscriptions
- **5 Videos** across different categories
- **4 Diet Plans** for different goals
- **4 Products** with varying stock levels
- **4 Team Members** from different departments
- **4 Chat Conversations** of different types
- **4 Notifications** for users

---

_This documentation covers all available endpoints in the GSB Admin API. For testing, use the provided Postman collection with the mock data._
