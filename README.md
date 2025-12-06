# Node.js + Express.js + MongoDB Backend Learning Project

A complete backend API project to learn Node.js, Express.js, and MongoDB with CRUD operations, error handling, and validation.

---

## 📦 Initial Setup

### 1. Initialize Your Project
```bash
npm init -y
```

### 2. Install Dependencies
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken multer cloudinary nodemailer
npm install nodemon --save-dev
npm install --save-dev @types/node @types/mongoose
```

**What each package does:**
- `express` - Web framework for building APIs
- `mongoose` - MongoDB object modeling tool
- `dotenv` - Loads environment variables from .env file
- `bcryptjs` - Password hashing library for security
- `jsonwebtoken` - Create and verify JWT tokens for authentication
- `multer` - Middleware for handling file uploads (multipart/form-data)
- `cloudinary` - Cloud storage service for images and videos
- `nodemailer` - Send emails from Node.js (notifications, alerts, etc.)
- `nodemon` - Auto-restarts server when files change (dev only)
- `@types/node` & `@types/mongoose` - Better autocomplete in VS Code

### 3. Start the Server
```bash
npm run dev    # Development (auto-restart)
npm start      # Production
```
Your server will run on `http://localhost:3000`

---

## 📁 Folder Structure (Best Practice)

```
my-api-project/
│
├── index.js              # Main entry point (server + error handling)
├── dbConnection.js       # MongoDB connection logic
├── .env                  # Environment variables (MongoDB URI, secrets, email)
├── package.json          # Project dependencies
│
├── routes/               # All API routes
│   ├── index.js         # Central route file (combines all routes)
│   ├── pingRoute.js     # /ping route
│   ├── userRoute.js     # /users routes
│   └── jobRoute.js      # /jobs routes (CRUD operations)
│
├── controllers/          # Business logic for each route
│   ├── pingController.js
│   ├── userController.js
│   ├── jobController.js  # Complete CRUD logic + email sending
│   └── Email.html       # HTML email template for job notifications
│
├── models/               # MongoDB schemas/models
│   ├── Users.js         # User model (with roles)
│   └── Jobs.js          # Job model (with validation)
│
├── config/               # Configuration files
│   └── cloudinaryConfig.js  # Cloudinary setup
│
└── middleware/           # Custom middleware
    ├── authMiddleware.js    # Authentication & authorization
    ├── jobMiddleware.js     # Job validation
    ├── upload.js            # Multer file upload config
    └── nodeConfig.js        # Nodemailer email config
```

---

## 🗄️ MongoDB Setup & Connection

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster
4. Create a database user (username + password)
5. Get your connection string

### Step 2: Create `.env` File
Create a `.env` file in your project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/databaseName?retryWrites=true&w=majority
PASSWORD_SALT_ROUNDS=10
JWT_EXPIRY=1d
JWT_SECRET_KEY=your-super-secret-key-here-change-this

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_SECRET_KEY=your-secret-key

GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-16-char-app-password
```

**Important:**
- Replace `username`, `password`, and `databaseName` with your actual values
- Change `JWT_SECRET_KEY` to a random, secure string (never share this!)
- `PASSWORD_SALT_ROUNDS` - Higher = more secure but slower (10 is good)
- `JWT_EXPIRY` - Token validity period (1d = 1 day, 7d = 7 days, 1h = 1 hour)
- Get Cloudinary credentials from [Cloudinary Dashboard](https://cloudinary.com/console)
- Get Gmail App Password from [Google App Passwords](https://myaccount.google.com/apppasswords) (requires 2-Step Verification)

### Step 3: Database Connection File
Create `dbConnection.js`:
```javascript
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting MongoDB: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
```

### Step 4: Connect in `index.js`
```javascript
const dotenv = require("dotenv");
dotenv.config();  // Load .env variables

const connectDB = require("./dbConnection");
connectDB();  // Connect to MongoDB
```

---

## 🎯 MVC Architecture (Simple Explanation)

**MVC = Model + View + Controller**

| Component | What It Does | Example in This Project |
|-----------|--------------|------------------------|
| **Model** | Defines data structure & database operations | `models/Jobs.js` |
| **View** | Frontend/UI (React, HTML, etc.) | Not in this project (backend only) |
| **Controller** | Handles requests, calls models, sends responses | `controllers/jobController.js` |

**Flow:** Request → Route → Controller → Model → Database → Response

---

## 📊 MongoDB Model with Validation

### What is a Schema?
A **schema** defines the structure of your data in MongoDB. It's like a blueprint for your documents.

### Job Model with Validation (`models/Jobs.js`):
```javascript
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },      // Required field
    company: { type: String },                     // Optional field
    location: { type: String },                    // Optional field
    salary: Number,                                // Optional number
    createdAt: { type: Date, default: Date.now }, // Auto-generated date
});

const Jobs = mongoose.model("Jobs", jobSchema);
module.exports = Jobs;
```

**Key Validation Options:**
- `required: true` - Field must be provided
- `type: String` - Data type validation
- `default: Date.now` - Auto-fill with current date
- `unique: true` - No duplicates allowed (e.g., email)
- `minlength: 5` - Minimum string length
- `maxlength: 100` - Maximum string length
- `min: 0` - Minimum number value
- `max: 1000000` - Maximum number value

---

## 🔄 Complete CRUD Operations

**CRUD = Create, Read, Update, Delete**

| Operation | HTTP Method | Route | Controller Method | Mongoose Method |
|-----------|-------------|-------|-------------------|-----------------|
| **Create** | POST | `/api/jobs` | `postJob` | `Jobs.create()` |
| **Read All** | GET | `/api/jobs` | `getAllJob` | `Jobs.find()` |
| **Read One** | GET | `/api/jobs/:id` | `fetchSingleJob` | `Jobs.findById()` |
| **Update** | PUT | `/api/jobs/:id` | `updateJob` | `Jobs.findByIdAndUpdate()` |
| **Delete** | DELETE | `/api/jobs/:id` | `deleteJob` | `Jobs.findByIdAndDelete()` |

---

## 🔑 Important Concepts to Remember

### 1. **Try-Catch Block (Error Handling)**

Every database operation can fail, so we use `try-catch`:

❌ **Without Error Handling:**
```javascript
exports.postJob = async (req, res) => {
    const job = await Jobs.create(req.body);  // What if this fails?
    res.status(201).json(job);
}
```

✅ **With Error Handling:**
```javascript
exports.postJob = async (req, res) => {
    try {
        const job = await Jobs.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
```

**Why?**
- Prevents server crashes
- Sends proper error messages to client
- Makes debugging easier

---

### 2. **HTTP Status Codes**

Status codes tell the client what happened:

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (new resource created) |
| **400** | Bad Request | Invalid data sent by client |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Something went wrong on server |

**Example:**
```javascript
// Success - 201 Created
res.status(201).json(job);

// Error - 400 Bad Request
res.status(400).json({ error: "Title is required" });

// Error - 404 Not Found
res.status(404).json({ error: "Job not found" });
```

---

### 3. **Global Error Handler Middleware**

Catches all errors in one place:

```javascript
// index.js - Add this AFTER all routes
app.use((error, req, res, next) => {
    res.status(500).json({ error: error.message });
});
```

**How it works:**
1. Any error in your app is caught here
2. Sends a 500 status code
3. Returns error message as JSON

**Important:** This must be placed **after** all routes!

---

### 4. **Route Parameters (`:id`)**

Use `:id` to get specific resources:

```javascript
// Route definition
router.get("/jobs/:id", fetchSingleJob);

// Controller - access with req.params.id
exports.fetchSingleJob = async (req, res) => {
    const job = await Jobs.findById(req.params.id);
    res.json(job);
}
```

**URL Examples:**
- `/api/jobs/123abc` → `req.params.id` = "123abc"
- `/api/jobs/xyz789` → `req.params.id` = "xyz789"

---

### 5. **Create Operation (POST)**

**Controller (`controllers/jobController.js`):**
```javascript
exports.postJob = async (req, res) => {
    try {
        const job = await Jobs.create(req.body);  // Create new job
        res.status(201).json(job);                // Return created job
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
```

**What happens:**
1. Get data from `req.body`
2. `Jobs.create()` validates and saves to database
3. If validation fails, catch block handles error
4. Return 201 status with created job

---

### 6. **Read Operations (GET)**

#### Get All Jobs:
```javascript
exports.getAllJob = async (req, res) => {
    try {
        const jobs = await Jobs.find();  // Get all jobs
        res.json(jobs);                  // Return array of jobs
    } catch (error) {
        console.log("Error in getting job", error);
    }
}
```

#### Get Single Job by ID:
```javascript
exports.fetchSingleJob = async (req, res) => {
    const job = await Jobs.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
}
```

**Key Points:**
- `Jobs.find()` - Returns all documents
- `Jobs.findById(id)` - Returns one document
- Always check if job exists before returning

---

### 7. **Update Operation (PUT)**

```javascript
exports.updateJob = async (req, res) => {
    const job = await Jobs.findByIdAndUpdate(
        req.params.id,    // Which job to update
        req.body,         // New data
        { new: true }     // Return updated document
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
}
```

**Important Options:**
- `{ new: true }` - Returns updated document (not old one)
- `{ runValidators: true }` - Runs schema validation on update

---

### 8. **Delete Operation (DELETE)**

```javascript
exports.deleteJob = async (req, res) => {
    try {
        const job = await Jobs.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: "Job Deleted" });
    } catch (error) {
        next(error);  // Pass to global error handler
    }
}
```

**What happens:**
1. Find job by ID and delete it
2. If not found, return 404 error
3. If found, return success message
4. Any other error goes to global handler

---

### 9. **Validation in Mongoose**

Mongoose validates data automatically:

```javascript
// Schema with validation
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Must provide title
    salary: Number,
});

// If you try to create without title:
const job = await Jobs.create({ salary: 50000 });
// Error: "title is required"
```

**Common Validation Errors:**
- Missing required field → "title is required"
- Wrong data type → "Cast to Number failed"
- Duplicate unique field → "E11000 duplicate key error"

---

### 10. **Request Body (`req.body`)**

To access POST/PUT data, you need:

```javascript
// index.js - MUST have this line
app.use(express.json());
```

**Then in controller:**
```javascript
exports.postJob = async (req, res) => {
    console.log(req.body);  // { title: "Developer", company: "ABC" }
    const job = await Jobs.create(req.body);
}
```

---

## 🔍 Advanced Features: Pagination, Sorting, Filtering & Searching

### What Are Query Parameters?

Query parameters are added to the URL after a `?` to modify the request:

```
GET /api/jobs?page=1&limit=10&sort=-salary&location=Remote&search=developer
```

**Breaking it down:**
- `?` - Starts query parameters
- `page=1` - First parameter
- `&` - Separates parameters
- `limit=10` - Second parameter
- And so on...

---

### 1. **Pagination** 📄

**What is Pagination?**
Instead of returning all 1000 jobs at once, return 10 jobs per page. This makes your API faster and saves bandwidth.

**Implementation:**
```javascript
const page = parseInt(req.query.page) || 1;      // Default: page 1
const limit = parseInt(req.query.limit) || 3;    // Default: 3 items per page
const skip = (page - 1) * limit;                 // Calculate how many to skip

const jobs = await Jobs.find()
    .skip(skip)    // Skip previous pages
    .limit(limit); // Limit results per page
```

**How it works:**
- **Page 1**: `skip = (1-1) * 3 = 0` → Show items 0-2
- **Page 2**: `skip = (2-1) * 3 = 3` → Show items 3-5
- **Page 3**: `skip = (3-1) * 3 = 6` → Show items 6-8

**Example Requests:**
```
GET /api/jobs?page=1&limit=5    # First 5 jobs
GET /api/jobs?page=2&limit=5    # Next 5 jobs
GET /api/jobs?page=3&limit=10   # Third page with 10 jobs
```

**Response Format:**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 5,
  "data": [...]
}
```

---

### 2. **Sorting** 🔢

**What is Sorting?**
Arrange results in a specific order (ascending or descending).

**Implementation:**
```javascript
const sortBy = req.query.sort || '-createdAt';  // Default: newest first
const jobs = await Jobs.find().sort(sortBy);
```

**How the `-` (minus) works:**
- **Without `-`**: Ascending (A→Z, 0→9, old→new)
- **With `-`**: Descending (Z→A, 9→0, new→old)

**Example Requests:**

| URL | Result |
|-----|--------|
| `/api/jobs?sort=salary` | Lowest to highest salary |
| `/api/jobs?sort=-salary` | Highest to lowest salary |
| `/api/jobs?sort=title` | A to Z by title |
| `/api/jobs?sort=-title` | Z to A by title |
| `/api/jobs?sort=createdAt` | Oldest first |
| `/api/jobs?sort=-createdAt` | Newest first (default) |

**Multiple Sort Fields:**
```
GET /api/jobs?sort=-salary,title  # Sort by salary DESC, then title ASC
```

---

### 3. **Filtering** 🎯

**What is Filtering?**
Show only jobs that match specific criteria (e.g., only jobs in "Remote" location).

**Implementation:**
```javascript
const filter = {};
if (req.query.location) {
    filter.location = req.query.location;
}

const jobs = await Jobs.find(filter);
```

**Example Requests:**
```
GET /api/jobs?location=Remote        # Only remote jobs
GET /api/jobs?location=New York      # Only New York jobs
GET /api/jobs?location=Remote&sort=-salary  # Remote jobs, highest salary first
```

**Multiple Filters:**
```javascript
const filter = {};
if (req.query.location) filter.location = req.query.location;
if (req.query.company) filter.company = req.query.company;
if (req.query.minSalary) filter.salary = { $gte: req.query.minSalary };

const jobs = await Jobs.find(filter);
```

**Advanced Filter Examples:**
```
GET /api/jobs?location=Remote&minSalary=80000
GET /api/jobs?company=Google&location=California
```

---

### 4. **Searching** 🔎

**What is Searching?**
Find jobs where the title contains specific text (case-insensitive).

**Implementation:**
```javascript
const search = req.query.search || "";

const jobs = await Jobs.find({
    title: { $regex: search, $options: 'i' }
});
```

**What is `$regex`?**
- `$regex` - Pattern matching (like SQL LIKE)
- `$options: 'i'` - Case insensitive (Developer = developer = DEVELOPER)

**Example Requests:**
```
GET /api/jobs?search=developer      # Find "developer" in title
GET /api/jobs?search=backend        # Find "backend" in title
GET /api/jobs?search=react          # Find "react" in title
```

**Search Results:**
- "Full Stack **Developer**" ✅
- "Senior **Backend** Engineer" ✅
- "**React** Frontend Developer" ✅
- "Data Scientist" ❌ (doesn't match)

---

### 5. **Combining Everything** 🎨

**Complete Implementation:**
```javascript
exports.getAllJob = async (req, res, next) => {
    try {
        // 1. Filtering
        const filter = {};
        if (req.query.location) filter.location = req.query.location;
        
        // 2. Searching
        const search = req.query.search || "";
        
        // 3. Sorting
        const sortBy = req.query.sort || '-createdAt';
        
        // 4. Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;
        
        // Execute query with all features
        const jobs = await Jobs.find({
            ...filter,
            title: { $regex: search, $options: "i" }
        })
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
        
        const totalJobs = await Jobs.countDocuments();
        
        res.json({
            success: true,
            total: totalJobs,
            page,
            limit,
            data: jobs,
        });
    } catch (error) {
        next(error);
    }
}
```

**Real-World Example:**
```
GET /api/jobs?search=developer&location=Remote&sort=-salary&page=1&limit=5
```

This will:
1. **Search** for "developer" in title
2. **Filter** by location = "Remote"
3. **Sort** by highest salary first
4. **Show** page 1 with 5 results

---

## 🔑 Important Concepts for Advanced Features

### 1. **Query Parameters vs Route Parameters**

**Route Parameters (`:id`):**
```javascript
GET /api/jobs/123abc  // 123abc is route parameter
router.get("/jobs/:id", controller);
// Access: req.params.id
```

**Query Parameters (`?key=value`):**
```javascript
GET /api/jobs?page=1&limit=5  // page and limit are query parameters
// Access: req.query.page, req.query.limit
```

---

### 2. **The Spread Operator (`...`)**

```javascript
const filter = { location: "Remote" };
const query = {
    ...filter,  // Spreads all properties from filter
    title: { $regex: search, $options: "i" }
};

// Result:
// {
//   location: "Remote",
//   title: { $regex: "developer", $options: "i" }
// }
```

**Why use it?**
- Combines multiple objects into one
- Keeps code clean and readable
- Easy to add/remove filters

---

### 3. **Empty String in Search (`""` vs `undefined`)**

❌ **Wrong:**
```javascript
const search = req.query.search || "";  // Empty string ""
title: { $regex: search, $options: "i" }  // Error if search is ""
```

✅ **Correct:**
```javascript
const search = req.query.search;  // Can be undefined

const query = { ...filter };
if (search && search.trim() !== '') {  // Only add if search exists
    query.title = { $regex: search, $options: 'i' };
}
```

**Why?**
- MongoDB's `$regex` requires a non-empty string
- Empty string causes error: "$regex has to be a string"
- Always check if search exists before using it

---

### 4. **parseInt() for Numbers**

```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 3;
```

**Why?**
- Query parameters are always **strings**: `"1"`, `"5"`, `"10"`
- `parseInt()` converts string to number: `"1"` → `1`
- Math operations need numbers: `(page - 1) * limit`

**Without parseInt:**
```javascript
const page = req.query.page || 1;  // page = "2" (string!)
const skip = (page - 1) * 3;       // "2" - 1 = NaN (error!)
```

---

### 5. **Mongoose Query Chaining**

You can chain multiple methods:

```javascript
const jobs = await Jobs.find(query)
    .sort(sortBy)      // First sort
    .skip(skip)        // Then skip
    .limit(limit)      // Then limit
    .select('title company salary');  // Optional: select specific fields
```

**Order matters!**
1. `find()` - Get matching documents
2. `sort()` - Sort them
3. `skip()` - Skip some
4. `limit()` - Limit results

---

### 6. **countDocuments() for Total Count**

```javascript
const totalJobs = await Jobs.countDocuments(query);
```

**Why?**
- Tells client how many total results exist
- Used for pagination UI (e.g., "Page 1 of 10")
- Should use same query as `find()` for accuracy

**Example Response:**
```json
{
  "total": 50,      // Total jobs matching query
  "page": 1,        // Current page
  "limit": 5,       // Items per page
  "data": [...]     // Actual jobs (5 items)
}
```

---

## 🔐 Authentication & Authorization

### What is Authentication?
**Authentication** = Verifying who you are (like showing your ID card)
**Authorization** = Checking what you're allowed to do (like checking if you have permission to enter a room)

---

### 1. **Password Hashing with bcrypt** 🔒

**Why Hash Passwords?**
Never store passwords in plain text! If someone hacks your database, they'll see all passwords.

**What is Hashing?**
- Converts password into a random-looking string
- One-way process (can't reverse it)
- Same password always gives same hash
- Even small change in password gives completely different hash

**Example:**
```
Password: "mypassword123"
Hashed:   "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

**Implementation:**
```javascript
const bcrypt = require('bcryptjs');

// Hashing password (during signup)
const hashedPassword = await bcrypt.hash(password, 10);
// 10 = salt rounds (higher = more secure but slower)

// Comparing password (during login)
const isMatch = await bcrypt.compare(password, hashedPassword);
// Returns true if password matches, false otherwise
```

---

### 2. **JWT (JSON Web Token)** 🎫

**What is JWT?**
A token that proves you're logged in. Like a ticket that says "This person is authenticated."

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Three Parts (separated by `.`):**
1. **Header** - Token type and algorithm
2. **Payload** - User data (userId, email, etc.)
3. **Signature** - Verifies token hasn't been tampered with

**Creating JWT:**
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { userId: user._id, email: user.email },  // Payload (data)
    process.env.JWT_SECRET_KEY,               // Secret key
    { expiresIn: '1d' }                       // Expires in 1 day
);
```

**Verifying JWT:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
console.log(decoded);  // { userId: '...', email: '...', iat: ..., exp: ... }
```

---

### 3. **User Registration (Signup)** 📝

**Flow:**
1. User sends name, email, password
2. Check if email already exists
3. Hash the password
4. Save user to database
5. Return success message

**Controller (`controllers/userController.js`):**
```javascript
exports.postUsers = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        next(error);
    }
}
```

**Important Points:**
- Always check if email already exists (prevent duplicates)
- Never save plain text passwords
- Use `bcrypt.hash()` with salt rounds (10 is standard)
- Return 201 status for successful creation

---

### 4. **User Login (Signin)** 🔑

**Flow:**
1. User sends email and password
2. Find user by email
3. Compare password with hashed password
4. If match, create JWT token
5. Return token to user

**Controller (`controllers/userController.js`):**
```javascript
exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );
        
        res.json({ token, message: "Login successful" });
    } catch (error) {
        next(error);
    }
}
```

**Important Points:**
- Don't reveal if email or password is wrong (security)
- Use generic message: "Invalid credentials"
- Token should expire (1d, 7d, etc.)
- Return token to client

---

### 5. **Protected Routes (Authentication Middleware)** 🛡️

**What is Middleware?**
Code that runs **before** your controller. Like a security guard checking your ticket before letting you in.

**Middleware (`middleware/authMiddleware.js`):**
```javascript
exports.protect = async (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // 2. Extract token
        const token = authHeader.split(" ")[1];  // "Bearer token123" → "token123"
        
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // 4. Get user from database
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        // 5. Attach user to request
        req.user = user;  // Now available in controller!
        next();  // Continue to controller
        
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
```

**How to Use:**
```javascript
// routes/userRoute.js
const { protect } = require("../middleware/authMiddleware");

router.get("/users", protect, getUsers);  // Protected route
//                    ↑ Middleware runs first
```

**Important Points:**
- Token format: `Bearer <token>`
- `.select("-password")` - Don't include password in user object
- `req.user` - User data available in all controllers after this middleware
- 401 status = Unauthorized (not logged in)

---

### 6. **Role-Based Access Control (Authorization)** 👑

**What is RBAC?**
Different users have different permissions. Example:
- **User** - Can view jobs, apply for jobs
- **Admin** - Can create, update, delete jobs

**User Model with Roles (`models/Users.js`):**
```javascript
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["user", "admin"],  // Only these values allowed
        default: "user"            // New users are "user" by default
    }
});
```

**Admin-Only Middleware (`middleware/authMiddleware.js`):**
```javascript
exports.adminOnly = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();  // User is admin, allow access
        } else {
            res.status(403).json({ message: "Admin only route" });
        }
    } catch (error) {
        next(error);
    }
}
```

**How to Use:**
```javascript
// routes/userRoute.js
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Only admins can access this
router.get("/users", protect, adminOnly, getUsers);
//                    ↑        ↑
//                    Auth     Authorization
```

**Important Points:**
- `protect` must come **before** `adminOnly`
- 403 status = Forbidden (logged in but no permission)
- `enum` in schema prevents invalid roles
- `req.user.role` - Available because of `protect` middleware

---

### 7. **Middleware Chain Order** ⛓️

**Order matters!**

```javascript
router.get("/users", protect, adminOnly, getUsers);
```

**Execution Flow:**
1. `protect` - Check if user is logged in
   - If not → Return 401 (Unauthorized)
   - If yes → Attach `req.user` and continue
2. `adminOnly` - Check if user is admin
   - If not → Return 403 (Forbidden)
   - If yes → Continue
3. `getUsers` - Controller executes

**Wrong Order:**
```javascript
router.get("/users", adminOnly, protect, getUsers);  // ❌ Wrong!
// adminOnly runs first, but req.user doesn't exist yet!
```

---

## 🔑 Important Authentication Concepts

### 1. **HTTP Status Codes for Auth**

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful login |
| **201** | Created | Successful signup |
| **400** | Bad Request | Invalid credentials, user exists |
| **401** | Unauthorized | No token, invalid token, expired token |
| **403** | Forbidden | Valid token but no permission (not admin) |

---

### 2. **Authorization Header Format**

**Client must send:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Breaking it down:**
- `Authorization` - Header name
- `Bearer` - Token type (standard for JWT)
- Space
- Actual token

**In Thunder Client/Postman:**
1. Go to "Headers" tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer <your-token-here>`

---

### 3. **Token Expiry**

**Why tokens expire:**
- Security (stolen tokens become useless after expiry)
- Force users to re-login periodically

**Common Expiry Times:**
- `1h` - 1 hour (high security apps)
- `1d` - 1 day (standard)
- `7d` - 7 days (convenience)
- `30d` - 30 days (long-lived sessions)

**Setting Expiry:**
```javascript
jwt.sign(payload, secret, { expiresIn: '1d' });
```

---

### 4. **Environment Variables for Auth**

```env
PASSWORD_SALT_ROUNDS=10
JWT_EXPIRY=1d
JWT_SECRET_KEY=your-super-secret-key-change-this
```

**Important:**
- `JWT_SECRET_KEY` - Must be long, random, and secret
- Never commit `.env` to Git
- Use different secrets for dev/production
- Change secret if compromised (all tokens become invalid)

---

### 5. **Security Best Practices**

1. **Never store plain text passwords** ✅
   ```javascript
   // ❌ Wrong
   const user = new User({ password: req.body.password });
   
   // ✅ Correct
   const hashedPassword = await bcrypt.hash(req.body.password, 10);
   const user = new User({ password: hashedPassword });
   ```

2. **Don't return password in responses** ✅
   ```javascript
   // ❌ Wrong
   const user = await User.findById(id);
   res.json(user);  // Includes password!
   
   // ✅ Correct
   const user = await User.findById(id).select("-password");
   res.json(user);  // Password excluded
   ```

3. **Use generic error messages** ✅
   ```javascript
   // ❌ Wrong (reveals if email exists)
   if (!user) return res.json({ message: "Email not found" });
   if (!isMatch) return res.json({ message: "Wrong password" });
   
   // ✅ Correct (generic message)
   if (!user || !isMatch) {
       return res.json({ message: "Invalid credentials" });
   }
   ```

4. **Validate token on every protected request** ✅
   - Don't trust client
   - Always verify token server-side
   - Check if user still exists

---

## ✅ Input Validation

### What is Validation?
**Validation** = Checking if the data sent by the user is correct and complete before saving it to the database.

**Why Validate?**
- Prevent bad data from entering your database
- Give users clear error messages
- Protect your app from crashes
- Ensure data consistency

---

### 1. **Two Types of Validation**

#### Schema-Level Validation (Mongoose)
Validation defined in your model schema. Mongoose checks this automatically.

```javascript
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Must provide title
    company: { type: String },                 // Optional
    salary: { type: Number, min: 0 }          // Must be positive
});
```

#### Middleware Validation (Custom)
Validation in middleware before reaching the controller. You write custom logic.

```javascript
exports.validateJobData = async (req, res, next) => {
    const { title, company } = req.body;
    if (!title || !company) {
        return res.status(400).json({ message: "Title or company is missing" });
    }
    next();
}
```

---

### 2. **Schema-Level Validation** 📋

**Common Validation Rules:**

| Rule | What It Does | Example |
|------|--------------|---------|
| `required: true` | Field must be provided | `title: { type: String, required: true }` |
| `unique: true` | No duplicates allowed | `email: { type: String, unique: true }` |
| `minlength: 5` | Minimum string length | `password: { type: String, minlength: 8 }` |
| `maxlength: 100` | Maximum string length | `title: { type: String, maxlength: 100 }` |
| `min: 0` | Minimum number value | `salary: { type: Number, min: 0 }` |
| `max: 1000000` | Maximum number value | `salary: { type: Number, max: 1000000 }` |
| `enum: [...]` | Only specific values allowed | `role: { type: String, enum: ["user", "admin"] }` |
| `default: value` | Default value if not provided | `createdAt: { type: Date, default: Date.now }` |

**Example Schema with Validation:**
```javascript
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Title must be at least 3 characters"],
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    company: {
        type: String,
        required: [true, "Company name is required"]
    },
    location: {
        type: String
    },
    salary: {
        type: Number,
        min: [0, "Salary cannot be negative"],
        max: [10000000, "Salary seems too high"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
```

**Custom Error Messages:**
```javascript
required: [true, "Custom error message here"]
//         ↑      ↑
//         Rule   Error message shown to user
```

---

### 3. **Middleware Validation** 🛡️

**When to Use Middleware Validation:**
- Complex validation logic (checking multiple fields together)
- Business rules (e.g., salary must be higher than minimum wage)
- Checking if related data exists in database
- Custom validation that Mongoose can't handle

**Implementation (`middleware/jobMiddleware.js`):**
```javascript
exports.validateJobData = async (req, res, next) => {
    try {
        const { title, company } = req.body;
        
        // Check if required fields exist
        if (!title || !company) {
            return res.status(400).json({
                message: "Title or company name is missing"
            });
        }
        
        // Check if title is too short
        if (title.length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters"
            });
        }
        
        // If all validations pass, continue
        next();
        
    } catch (error) {
        next(error);
    }
}
```

**Using Validation Middleware:**
```javascript
// routes/jobRoute.js
const { validateJobData } = require("../middleware/jobMiddleware");

router.post("/jobs", validateJobData, postJob);
//                    ↑ Validation runs before controller
```

**Execution Flow:**
1. Request comes in
2. `validateJobData` middleware runs
   - If validation fails → Return 400 error
   - If validation passes → Call `next()`
3. `postJob` controller runs
4. Data saved to database

---

### 4. **Validation Error Responses** ⚠️

**Schema Validation Error:**
```javascript
// Request
POST /api/jobs
{
  "company": "Tech Corp"
  // Missing "title" field
}

// Response (400 Bad Request)
{
  "error": "Jobs validation failed: title: Path `title` is required."
}
```

**Middleware Validation Error:**
```javascript
// Request
POST /api/jobs
{
  "title": "Dev"
  // Missing "company" field
}

// Response (400 Bad Request)
{
  "message": "Title or company name is missing"
}
```

---

### 5. **Validation Best Practices** 💡

#### 1. **Validate Early**
```javascript
// ✅ Good - Validate in middleware before controller
router.post("/jobs", validateJobData, postJob);

// ❌ Bad - Validate inside controller (too late)
exports.postJob = async (req, res) => {
    if (!req.body.title) return res.status(400).json({...});
    // ... rest of code
}
```

#### 2. **Use Clear Error Messages**
```javascript
// ❌ Bad - Generic message
{ message: "Invalid data" }

// ✅ Good - Specific message
{ message: "Title or company name is missing" }
```

#### 3. **Validate Data Types**
```javascript
// Check if salary is a number
if (typeof salary !== 'number') {
    return res.status(400).json({
        message: "Salary must be a number"
    });
}
```

#### 4. **Trim Whitespace**
```javascript
const title = req.body.title?.trim();
if (!title) {
    return res.status(400).json({
        message: "Title cannot be empty"
    });
}
```

#### 5. **Validate Email Format**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({
        message: "Invalid email format"
    });
}
```

---

### 6. **Combining Schema + Middleware Validation** 🎯

**Best Approach:** Use both together!

**Schema Validation (Basic Rules):**
```javascript
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    salary: { type: Number, min: 0 }
});
```

**Middleware Validation (Complex Rules):**
```javascript
exports.validateJobData = async (req, res, next) => {
    const { title, company, salary } = req.body;
    
    // Check required fields
    if (!title || !company) {
        return res.status(400).json({
            message: "Title and company are required"
        });
    }
    
    // Check title length
    if (title.trim().length < 3) {
        return res.status(400).json({
            message: "Title must be at least 3 characters"
        });
    }
    
    // Check if salary is reasonable
    if (salary && (salary < 0 || salary > 10000000)) {
        return res.status(400).json({
            message: "Salary must be between 0 and 10,000,000"
        });
    }
    
    next();
}
```

**Why Both?**
- Schema validation = Safety net (catches everything)
- Middleware validation = Better error messages (user-friendly)

---

### 7. **Validation Middleware Order** ⛓️

**Correct Order:**
```javascript
router.post("/jobs", validateJobData, protect, postJob);
//                   ↑ 1st          ↑ 2nd   ↑ 3rd
//                   Validate       Auth    Controller
```

**Why This Order?**
1. **Validate first** - No point checking auth if data is invalid
2. **Then authenticate** - Check if user is logged in
3. **Finally controller** - Process the request

**Wrong Order:**
```javascript
router.post("/jobs", protect, validateJobData, postJob);  // ❌
// Wastes time checking auth for invalid data
```

---

## 🔑 Important Validation Concepts

### 1. **Validation vs Sanitization**

| Validation | Sanitization |
|------------|--------------|
| Checks if data is correct | Cleans/modifies data |
| Returns error if invalid | Fixes data automatically |
| Example: "Email is required" | Example: Trim whitespace |

**Example:**
```javascript
// Sanitization (clean data)
const title = req.body.title?.trim().toLowerCase();

// Validation (check data)
if (!title) {
    return res.status(400).json({ message: "Title is required" });
}
```

---

### 2. **Client-Side vs Server-Side Validation**

| Client-Side (Frontend) | Server-Side (Backend) |
|------------------------|----------------------|
| Fast feedback to user | Security (can't be bypassed) |
| Better UX | Must always be present |
| Can be bypassed | Final line of defense |

**Important:** Always validate on server-side! Client-side is optional but recommended.

---

### 3. **Validation Error Status Codes**

| Code | When to Use |
|------|-------------|
| **400** | Bad Request - Invalid data format |
| **422** | Unprocessable Entity - Valid format but business rule violation |

**Example:**
```javascript
// 400 - Missing required field
if (!title) return res.status(400).json({...});

// 422 - Valid data but business rule fails
if (salary < minimumWage) return res.status(422).json({...});
```

---

## 📧 Sending Emails with Nodemailer

### What is Nodemailer?
**Nodemailer** is a module that allows you to send emails from your Node.js application. It's like having a post office inside your app that can send emails automatically.

**Why Send Emails?**
- Notify users about new job postings
- Send welcome emails after signup
- Password reset links
- Order confirmations
- Newsletters and updates

---

### 1. **Understanding Email Sending** 📬

```
Your App → Nodemailer → Gmail/SMTP Server → Recipient's Email
    ↓          ↓              ↓                    ↓
  Create    Configure      Send via           User receives
  Email     Transport      Internet           email
```

**Step-by-Step:**
1. Your app creates an email (subject, body, recipient)
2. Nodemailer connects to email service (Gmail, Outlook, etc.)
3. Email service sends the email over the internet
4. Recipient receives the email in their inbox

---

### 2. **Installing Nodemailer** 📦

```bash
npm install nodemailer
```

**Add to package.json dependencies:**
```json
{
  "dependencies": {
    "nodemailer": "^7.0.11"
  }
}
```

---

### 3. **Gmail App Password Setup** 🔐

**Why App Password?**
Gmail doesn't allow apps to use your regular password for security. You need a special "App Password."

**Steps to Get Gmail App Password:**

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Follow steps to enable it

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter name: "Node.js App"
   - Click "Generate"
   - Copy the 16-character password (e.g., `gmej ocnn ejgd kgub`)

3. **Add to `.env` file:**
   ```env
   GOOGLE_EMAIL=your-email@gmail.com
   GOOGLE_APP_PASSWORD=your app password
   ```

**Important:**
- Never use your regular Gmail password
- Never commit `.env` file to Git
- App password is 16 characters with spaces
- Keep it secret and secure

---

### 4. **Nodemailer Configuration** ⚙️

**Create `middleware/nodeConfig.js`:**
```javascript
const nodemailer = require("nodemailer");

// Create transporter (email sender)
const transporter = nodemailer.createTransport({
    service: "Gmail",                              // Email service
    auth: {
        user: process.env.GOOGLE_EMAIL,            // Your Gmail
        pass: process.env.GOOGLE_APP_PASSWORD      // App password
    },
    connectionTimeout: 10000,                      // 10 seconds timeout
});

module.exports = transporter;
```

**What is a Transporter?**
A transporter is like a mail carrier. It knows:
- Which email service to use (Gmail, Outlook, etc.)
- Your email credentials
- How to send emails

**Other Email Services:**
```javascript
// Outlook
service: "Outlook365"

// Yahoo
service: "Yahoo"

// Custom SMTP
host: "smtp.example.com"
port: 587
```

---

### 5. **HTML Email Template** 🎨

**Create `controllers/Email.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Job: {{title}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background-color: #1f2937;
      color: #ffffff;
      padding: 16px 24px;
      text-align: center;
    }
    .email-body {
      padding: 20px 24px;
    }
    .job-title {
      font-size: 22px;
      font-weight: bold;
      color: #111827;
    }
    .salary {
      font-size: 16px;
      font-weight: 600;
      color: #059669;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>New Job Opportunity</h1>
    </div>
    <div class="email-body">
      <p class="job-title">{{title}}</p>
      <p><strong>Company:</strong> {{company}}</p>
      <p><strong>Location:</strong> {{location}}</p>
      <p><strong>Posted On:</strong> {{createdAt}}</p>
      <p class="salary">Salary: {{salary}}</p>
      <p>If you're interested, please apply or reach out for more details.</p>
    </div>
  </div>
</body>
</html>
```

**What are `{{placeholders}}`?**
- `{{title}}` - Will be replaced with actual job title
- `{{company}}` - Will be replaced with company name
- `{{location}}` - Will be replaced with location
- These are like blanks in a form that you fill in

---

### 6. **Sending Emails in Controller** 📤

**Update `controllers/jobController.js`:**
```javascript
const Jobs = require("../models/Jobs");
const User = require("../models/Users");
const fs = require("fs");
const path = require("path");
const transporter = require("../middleware/nodeConfig");

exports.postJob = async (req, res) => {
    try {
        // 1. Create job in database
        const job = await Jobs.create(req.body);
        
        // 2. Find all employees (users with role "employee")
        const employees = await User.find({ role: "employee" });
        
        // 3. Read HTML email template
        const templatePath = path.join(__dirname, "Email.html");
        let emailTemplate = fs.readFileSync(templatePath, "utf-8");
        
        // 4. Replace placeholders with actual data
        emailTemplate = emailTemplate
            .replace(/{{title}}/g, job.title)
            .replace(/{{company}}/g, job.company || "Not specified")
            .replace(/{{location}}/g, job.location || "Remote")
            .replace(/{{createdAt}}/g, job.createdAt.toDateString())
            .replace(/{{salary}}/g, job.salary ? `₹${job.salary}` : "Not disclosed");
        
        // 5. Send email to each employee
        for (let employee of employees) {
            const mailOptions = {
                from: process.env.GOOGLE_EMAIL,        // Sender
                to: employee.email,                    // Recipient
                subject: "New Job Opportunity",        // Email subject
                html: emailTemplate                    // HTML content
            };
            
            await transporter.sendMail(mailOptions);
        }
        
        // 6. Return created job
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
```

---

### 7. **Understanding the Email Flow** 🔄

**Step-by-Step Breakdown:**

1. **Create Job:**
   ```javascript
   const job = await Jobs.create(req.body);
   ```
   - Saves job to database
   - Returns job object with all details

2. **Find Recipients:**
   ```javascript
   const employees = await User.find({ role: "employee" });
   ```
   - Finds all users with role "employee"
   - Returns array of user objects

3. **Read Template:**
   ```javascript
   const templatePath = path.join(__dirname, "Email.html");
   let emailTemplate = fs.readFileSync(templatePath, "utf-8");
   ```
   - `path.join()` - Creates correct file path
   - `fs.readFileSync()` - Reads file content as string
   - `"utf-8"` - Text encoding format

4. **Replace Placeholders:**
   ```javascript
   emailTemplate = emailTemplate.replace(/{{title}}/g, job.title);
   ```
   - `/{{title}}/g` - Regex pattern (finds all `{{title}}`)
   - `g` flag - Global (replaces all occurrences)
   - Replaces with actual job title

5. **Send Emails:**
   ```javascript
   for (let employee of employees) {
       await transporter.sendMail(mailOptions);
   }
   ```
   - Loops through each employee
   - Sends personalized email to each one
   - `await` - Waits for email to send before continuing

---

### 8. **Email Options Explained** 📋

```javascript
const mailOptions = {
    from: process.env.GOOGLE_EMAIL,           // Sender email
    to: employee.email,                       // Recipient email
    subject: "New Job Opportunity",           // Email subject line
    html: emailTemplate,                      // HTML content
    // Optional fields:
    cc: "manager@example.com",                // Carbon copy
    bcc: "admin@example.com",                 // Blind carbon copy
    attachments: [                            // File attachments
        {
            filename: "job-details.pdf",
            path: "./files/job-details.pdf"
        }
    ]
};
```

**Field Explanations:**
- `from` - Who is sending the email
- `to` - Who receives the email (can be array for multiple)
- `subject` - Email subject line (what user sees in inbox)
- `html` - Email body in HTML format
- `text` - Plain text version (optional, for email clients that don't support HTML)
- `cc` - Carbon copy (recipient can see other CC recipients)
- `bcc` - Blind carbon copy (recipient can't see other BCC recipients)

---

### 9. **Sending to Multiple Recipients** 👥

**Single Recipient:**
```javascript
to: "user@example.com"
```

**Multiple Recipients (Array):**
```javascript
to: ["user1@example.com", "user2@example.com", "user3@example.com"]
```

**Multiple Recipients (String):**
```javascript
to: "user1@example.com, user2@example.com, user3@example.com"
```

**Loop Through Users:**
```javascript
for (let employee of employees) {
    const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: employee.email,
        subject: "New Job Opportunity",
        html: emailTemplate
    };
    await transporter.sendMail(mailOptions);
}
```

---

### 10. **Template Placeholders** 🔤

**Using Regular Expressions:**
```javascript
// Replace single occurrence
emailTemplate = emailTemplate.replace("{{title}}", job.title);

// Replace all occurrences (with /g flag)
emailTemplate = emailTemplate.replace(/{{title}}/g, job.title);
```

**Multiple Replacements:**
```javascript
emailTemplate = emailTemplate
    .replace(/{{title}}/g, job.title)
    .replace(/{{company}}/g, job.company || "Not specified")
    .replace(/{{location}}/g, job.location || "Remote")
    .replace(/{{salary}}/g, job.salary ? `₹${job.salary}` : "Not disclosed");
```

**Why `/g` flag?**
- Without `g`: Replaces only first occurrence
- With `g`: Replaces all occurrences in the template

**Conditional Values:**
```javascript
job.company || "Not specified"
// If job.company exists → use it
// If job.company is null/undefined → use "Not specified"

job.salary ? `₹${job.salary}` : "Not disclosed"
// If salary exists → show "₹80000"
// If salary doesn't exist → show "Not disclosed"
```

---

### 11. **Error Handling for Emails** ⚠️

**Basic Error Handling:**
```javascript
try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
} catch (error) {
    console.error("Error sending email:", error.message);
}
```

**Continue on Email Failure:**
```javascript
for (let employee of employees) {
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${employee.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${employee.email}:`, error.message);
        // Continue to next employee even if this one fails
    }
}
```

**Don't Block Job Creation:**
```javascript
exports.postJob = async (req, res) => {
    try {
        // Create job first
        const job = await Jobs.create(req.body);
        
        // Send emails (don't wait for completion)
        sendEmailsToEmployees(job).catch(err => {
            console.error("Email sending failed:", err);
        });
        
        // Return response immediately
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
```

---

### 12. **Testing Email Functionality** 🧪

**Using Thunder Client/Postman:**

1. **Create a job:**
   ```
   POST http://localhost:3000/api/jobs
   Content-Type: application/json
   
   {
     "title": "Full Stack Developer",
     "company": "Tech Corp",
     "location": "Remote",
     "salary": 80000
   }
   ```

2. **Check your email inbox:**
   - All users with role "employee" should receive an email
   - Email should have job details
   - HTML formatting should be visible

3. **Check console logs:**
   ```
   Email sent to user1@example.com
   Email sent to user2@example.com
   ```

---

### 13. **Common Email Issues & Solutions** 🔧

**Issue 1: "Invalid login" error**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:**
- Make sure you're using App Password, not regular password
- Check if 2-Step Verification is enabled
- Verify email and password in `.env` file

---

**Issue 2: "Connection timeout"**
```
Error: Connection timeout
```
**Solution:**
- Check your internet connection
- Increase `connectionTimeout` in config
- Try different email service

---

**Issue 3: "Template not found"**
```
Error: ENOENT: no such file or directory
```
**Solution:**
- Check file path: `path.join(__dirname, "Email.html")`
- Make sure `Email.html` is in same folder as controller
- Use absolute path if needed

---

**Issue 4: Emails going to spam**
**Solution:**
- Use professional email subject
- Don't use too many links
- Include unsubscribe option
- Use verified domain (for production)

---

### 14. **Environment Variables for Email** 🔐

**Add to `.env` file:**
```env
# Email Configuration
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_APP_PASSWORD=gmej ocnn ejgd kgub
```

**Important:**
- Never commit `.env` to Git
- Add `.env` to `.gitignore`
- Use different credentials for dev/production
- Keep App Password secret

---

### 15. **Advanced Email Features** 🚀

**Attachments:**
```javascript
const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: employee.email,
    subject: "New Job Opportunity",
    html: emailTemplate,
    attachments: [
        {
            filename: "job-description.pdf",
            path: "./files/job-description.pdf"
        },
        {
            filename: "company-logo.png",
            path: "./images/logo.png"
        }
    ]
};
```

**Inline Images:**
```javascript
attachments: [
    {
        filename: "logo.png",
        path: "./images/logo.png",
        cid: "logo@company"  // Content ID
    }
]

// In HTML template:
<img src="cid:logo@company" alt="Company Logo" />
```

**Plain Text Alternative:**
```javascript
const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: employee.email,
    subject: "New Job Opportunity",
    html: emailTemplate,
    text: `New Job: ${job.title} at ${job.company}`  // Fallback
};
```

---

## 🔑 Important Email Concepts

### 1. **SMTP (Simple Mail Transfer Protocol)**

**What is SMTP?**
The protocol (set of rules) used to send emails over the internet. Like the postal service rules for sending mail.

**SMTP Settings:**
```javascript
{
    host: "smtp.gmail.com",    // SMTP server address
    port: 587,                 // Port number (587 for TLS)
    secure: false,             // true for 465, false for other ports
    auth: {
        user: "your-email@gmail.com",
        pass: "your-app-password"
    }
}
```

---

### 2. **Synchronous vs Asynchronous Email Sending**

**Synchronous (Wait for email):**
```javascript
await transporter.sendMail(mailOptions);  // Waits for email to send
res.json({ message: "Job created and email sent" });
```
- Slower response
- User waits for email to send
- Good for critical emails

**Asynchronous (Don't wait):**
```javascript
transporter.sendMail(mailOptions).catch(err => console.error(err));
res.json({ message: "Job created" });  // Immediate response
```
- Faster response
- Email sends in background
- Good for non-critical emails

---

### 3. **Email Rate Limits**

**Gmail Limits:**
- 500 emails per day (free account)
- 2000 emails per day (Google Workspace)
- 100 recipients per email

**Best Practices:**
- Don't send too many emails at once
- Add delay between emails
- Use email service providers for bulk emails (SendGrid, Mailgun)

**Adding Delay:**
```javascript
for (let employee of employees) {
    await transporter.sendMail(mailOptions);
    await new Promise(resolve => setTimeout(resolve, 1000));  // 1 second delay
}
```

---

### 4. **HTML vs Plain Text Emails**

| HTML Emails | Plain Text Emails |
|-------------|-------------------|
| Beautiful formatting | Simple text only |
| Images, colors, styles | No formatting |
| Better user experience | Works everywhere |
| May go to spam | Less likely to spam |

**Best Practice:** Send both!
```javascript
const mailOptions = {
    html: emailTemplate,                    // HTML version
    text: "New Job: Developer at Tech Corp" // Plain text fallback
};
```

---

### 5. **Email Security**

**Important Security Practices:**
1. ✅ Use App Passwords (not regular passwords)
2. ✅ Store credentials in `.env` file
3. ✅ Never commit `.env` to Git
4. ✅ Use HTTPS in production
5. ✅ Validate email addresses before sending
6. ✅ Implement rate limiting
7. ✅ Use email verification for signups

---

## 🚀 Current API Endpoints

### Authentication Endpoints:

| Method | Endpoint | Description | Auth Required | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| POST | `/api/users` | Register new user | No | `{ name, email, password }` | Success message |
| POST | `/api/users/signin` | Login user | No | `{ email, password }` | `{ token, message }` |
| GET | `/api/users` | Get all users | Yes (Admin only) | - | Array of users |

### Jobs API (Complete CRUD + Advanced Features):

| Method | Endpoint | Description | Auth Required | Query Parameters | Response |
|--------|----------|-------------|---------------|------------------|----------|
| POST | `/api/jobs` | Create new job | No | - | Created job object |
| GET | `/api/jobs` | Get all jobs with filters | No | `page`, `limit`, `sort`, `search`, `location` | Paginated job objects |
| GET | `/api/jobs/:id` | Get single job | No | - | Single job object |
| PUT | `/api/jobs/:id` | Update job | No | - | Updated job object |
| DELETE | `/api/jobs/:id` | Delete job | No | - | `{ message: "Job Deleted" }` |

**Query Parameters Explained:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 3)
- `sort` - Sort field (e.g., `salary`, `-salary`, `title`)
- `search` - Search in title (case-insensitive)
- `location` - Filter by exact location

### Other Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Check if API is working |
| GET | `/api/ping` | Test ping endpoint |

---

## 🧪 Testing Authentication

### 1. SIGNUP - Register New User
```
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully"
}
```

**Error Response (400 - User Exists):**
```json
{
  "message": "User already exist with this email."
}
```

---

### 2. SIGNIN - Login User
```
POST http://localhost:3000/api/users/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyZjE3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzM0NzU2MDAsImV4cCI6MTczMzU2MjAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "message": "Login Successful"
}
```

**Error Response (400 - Invalid Credentials):**
```json
{
  "message": "Invalid Credentials"
}
```

**Important:** Save the token! You'll need it for protected routes.

---

### 3. GET USERS - Protected Route (Admin Only)
```
GET http://localhost:3000/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK - If Admin):**
```json
[
  {
    "_id": "6752f177bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  {
    "_id": "6752f177bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user"
  }
]
```

**Error Response (401 - No Token):**
```json
{
  "message": "Unauthorized. Not A Valid Token"
}
```

**Error Response (403 - Not Admin):**
```json
{
  "message": "Admin only Route"
}
```

---

### Testing in Thunder Client:

#### For Signup/Signin:
1. Create new request
2. Set method to POST
3. Enter URL
4. Go to "Body" → Select "JSON"
5. Enter user data
6. Click Send

#### For Protected Routes:
1. First, login and copy the token
2. Create new request
3. Go to "Headers" tab
4. Add header:
   - Key: `Authorization`
   - Value: `Bearer <paste-token-here>`
5. Click Send

---

## 🧪 Testing CRUD Operations

### 1. CREATE (POST) - Add New Job
```
POST http://localhost:3000/api/jobs
Content-Type: application/json

{
  "title": "Full Stack Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": 80000
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Full Stack Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": 80000,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. READ (GET) - Get All Jobs
```
GET http://localhost:3000/api/jobs
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Full Stack Developer",
    "company": "Tech Corp",
    "location": "Remote",
    "salary": 80000,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Backend Developer",
    "company": "StartUp Inc",
    "location": "New York",
    "salary": 90000,
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

### 3. READ (GET) - Get Single Job
```
GET http://localhost:3000/api/jobs/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Full Stack Developer",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": 80000,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Job not found"
}
```

---

### 4. UPDATE (PUT) - Update Job
```
PUT http://localhost:3000/api/jobs/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "salary": 95000,
  "location": "Hybrid"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Full Stack Developer",
  "company": "Tech Corp",
  "location": "Hybrid",
  "salary": 95000,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. DELETE (DELETE) - Delete Job
```
DELETE http://localhost:3000/api/jobs/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "message": "Job Deleted"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Job not found"
}
```

---

## 🛠️ Testing Tools

### Using Thunder Client (VS Code Extension):
1. Install Thunder Client extension
2. Create new request
3. Select method (GET, POST, PUT, DELETE)
4. Enter URL
5. For POST/PUT: Go to "Body" → Select "JSON" → Enter data
6. Click Send

### Using Postman:
1. Download Postman
2. Create new request
3. Same steps as Thunder Client

### Using cURL (Terminal):
```bash
# CREATE
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Developer","company":"ABC","salary":70000}'

# READ ALL
curl http://localhost:3000/api/jobs

# READ ONE
curl http://localhost:3000/api/jobs/507f1f77bcf86cd799439011

# UPDATE
curl -X PUT http://localhost:3000/api/jobs/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"salary":80000}'

# DELETE
curl -X DELETE http://localhost:3000/api/jobs/507f1f77bcf86cd799439011
```

---

## 🧪 Testing Advanced Features

### Example 1: Basic Pagination
```
GET http://localhost:3000/api/jobs?page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 5,
  "data": [
    { "_id": "...", "title": "Developer", "salary": 80000 },
    { "_id": "...", "title": "Designer", "salary": 70000 },
    // ... 3 more jobs
  ]
}
```

---

### Example 2: Sorting by Salary (Highest First)
```
GET http://localhost:3000/api/jobs?sort=-salary&limit=5
```

**Response:** Top 5 highest-paying jobs

---

### Example 3: Search for "Developer"
```
GET http://localhost:3000/api/jobs?search=developer
```

**Response:** All jobs with "developer" in title

---

### Example 4: Filter by Location
```
GET http://localhost:3000/api/jobs?location=Remote
```

**Response:** Only remote jobs

---

### Example 5: Combining Everything
```
GET http://localhost:3000/api/jobs?search=developer&location=Remote&sort=-salary&page=1&limit=5
```

**What this does:**
1. Search for "developer" in title
2. Filter by Remote location
3. Sort by highest salary
4. Show page 1
5. Limit to 5 results

**Response:** Top 5 highest-paying remote developer jobs

---

## 📝 Common Mistakes to Avoid

### Database & MongoDB:
1. ❌ Forgetting to call `connectDB()` in `index.js`
2. ❌ Not using `async/await` for database operations
3. ❌ Hardcoding MongoDB URI instead of using `.env`
4. ❌ Not adding `.env` to `.gitignore`
5. ❌ Forgetting `app.use(express.json())` for POST/PUT requests

### Error Handling:
6. ❌ Not using `try-catch` blocks
7. ❌ Not checking if resource exists before operations
8. ❌ Not sending proper HTTP status codes
9. ❌ Forgetting global error handler middleware
10. ❌ Not validating required fields in schema

### CRUD Operations:
11. ❌ Using `{ new: true }` in update but forgetting it
12. ❌ Not handling 404 errors for single resource operations
13. ❌ Forgetting to use `req.params.id` for route parameters
14. ❌ Not returning proper response after operations

### Advanced Features:
15. ❌ Using empty string `""` in `$regex` (causes error)
16. ❌ Not using `parseInt()` for page and limit (causes NaN)
17. ❌ Wrong calculation: `skip = (page - 1) * skip` instead of `* limit`
18. ❌ Forgetting to check if search exists before using `$regex`
19. ❌ Not using `countDocuments()` with same query as `find()`
20. ❌ Wrong query chaining order (limit before skip, etc.)

### Authentication & Security (NEW):
21. ❌ Storing passwords in plain text (always hash with bcrypt!)
22. ❌ Not checking if user already exists during signup
23. ❌ Returning password in API responses (use `.select("-password")`)
24. ❌ Revealing if email or password is wrong (use generic "Invalid credentials")
25. ❌ Not validating token on protected routes
26. ❌ Wrong middleware order (adminOnly before protect)
27. ❌ Committing `.env` file with JWT_SECRET_KEY to Git
28. ❌ Using weak or short JWT secret keys
29. ❌ Not setting token expiry (tokens should expire)
30. ❌ Forgetting `Bearer` prefix in Authorization header

---

## 🎓 Learning Progress Checklist

- [x] Basic routing
- [x] Folder structure (MVC pattern)
- [x] MongoDB connection
- [x] Environment variables (.env)
- [x] Mongoose models (Schema)
- [x] Schema validation (required fields)
- [x] GET request (Read all data)
- [x] GET request with ID (Read single data)
- [x] POST request (Create data)
- [x] PUT request (Update data)
- [x] DELETE request (Delete data)
- [x] Error handling (try-catch)
- [x] HTTP status codes
- [x] Global error handler middleware
- [x] Route parameters (`:id`)
- [x] Query parameters (`?key=value`)
- [x] Pagination (page & limit)
- [x] Sorting (ascending & descending)
- [x] Filtering (by specific fields)
- [x] Searching (regex pattern matching)
- [x] Combining multiple features
- [x] Password hashing (bcrypt)
- [x] User registration (signup)
- [x] User login (signin with JWT)
- [x] JWT token creation and verification
- [x] Protected routes (authentication middleware)
- [x] Role-based access control (admin/user)
- [x] Authorization middleware
- [ ] Advanced validation (custom validators)
- [ ] Refresh tokens
- [ ] Password reset functionality
- [ ] Email verification
- [ ] File uploads
- [ ] Relationships (populate)

---

## 💡 Quick Reference

### CRUD Operations Cheat Sheet:

```javascript
// CREATE
const job = await Jobs.create(req.body);

// READ ALL
const jobs = await Jobs.find();

// READ ONE
const job = await Jobs.findById(id);

// UPDATE
const job = await Jobs.findByIdAndUpdate(id, data, { new: true });

// DELETE
const job = await Jobs.findByIdAndDelete(id);
```

### Advanced Features Cheat Sheet:

```javascript
// PAGINATION
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

// SORTING
const sortBy = req.query.sort || '-createdAt';  // - for descending

// FILTERING
const filter = {};
if (req.query.location) filter.location = req.query.location;

// SEARCHING
const search = req.query.search;
if (search && search.trim() !== '') {
    query.title = { $regex: search, $options: 'i' };
}

// COMBINE ALL
const jobs = await Jobs.find({ ...filter, ...searchQuery })
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

const total = await Jobs.countDocuments({ ...filter, ...searchQuery });
```

### Query Parameters Examples:

```javascript
// Access query parameters
req.query.page      // ?page=1
req.query.limit     // ?limit=10
req.query.sort      // ?sort=-salary
req.query.search    // ?search=developer
req.query.location  // ?location=Remote

// Multiple parameters
// ?page=1&limit=5&sort=-salary&search=developer&location=Remote
```

### Authentication Cheat Sheet:

```javascript
// HASH PASSWORD (Signup)
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);

// COMPARE PASSWORD (Login)
const isMatch = await bcrypt.compare(password, user.password);

// CREATE JWT TOKEN
const jwt = require('jsonwebtoken');
const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' }
);

// VERIFY JWT TOKEN
const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

// PROTECT MIDDLEWARE
exports.protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
};

// ADMIN ONLY MIDDLEWARE
exports.adminOnly = (req, res, next) => {
    if (req.user.role === "admin") next();
    else res.status(403).json({ message: "Admin only" });
};

// USE IN ROUTES
router.get("/users", protect, adminOnly, getUsers);
```

### Error Handling Pattern:

```javascript
exports.controllerName = async (req, res, next) => {
    try {
        // Your database operation
        const result = await Model.operation();
        res.status(200).json(result);
    } catch (error) {
        next(error);  // Pass to global error handler
    }
}
```

### Validation in Schema:

```javascript
const schema = new mongoose.Schema({
    field1: { type: String, required: true },
    field2: { type: Number, min: 0, max: 1000 },
    field3: { type: String, unique: true },
    field4: { type: Date, default: Date.now },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});
```

---

## 🔗 Useful Resources

- [Express.js Official Docs](https://expressjs.com/)
- [Mongoose Official Docs](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Best Practices](https://restfulapi.net/)

---

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore` ✅
2. **Use environment variables** for sensitive data ✅
3. **Hash passwords with bcrypt** - Never store plain text ✅
4. **Use strong JWT secret keys** - Long, random, and secret ✅
5. **Set token expiry** - Tokens should expire (1d, 7d, etc.) ✅
6. **Validate all user input** in schema ✅
7. **Use try-catch blocks** for all database operations ✅
8. **Don't return passwords** in API responses (`.select("-password")`) ✅
9. **Use generic error messages** - Don't reveal if email exists ✅
10. **Verify tokens on every request** - Don't trust client ✅
11. **Use HTTPS in production** - Encrypt data in transit ✅
12. **Keep dependencies updated** - `npm audit fix` ✅
13. **Implement rate limiting** - Prevent brute force attacks (next step)
14. **Use helmet.js** - Security headers (next step)

---

## 🎯 Next Steps

Now that you've mastered CRUD operations, authentication, and authorization, here's what to learn next:

1. **Refresh Tokens** - Long-lived tokens for better UX
2. **Password Reset** - Email-based password recovery
3. **Email Verification** - Verify user email on signup
4. **Advanced Validation** - Custom validators, regex patterns
5. **File Uploads** - Handling images and documents with multer
6. **Relationships** - Connecting models (populate, references)
7. **Rate Limiting** - Prevent brute force attacks (express-rate-limit)
8. **Security Headers** - Using helmet.js
9. **CORS** - Cross-Origin Resource Sharing
10. **Testing** - Unit tests and integration tests (Jest, Supertest)
11. **Logging** - Winston or Morgan for better debugging
12. **API Documentation** - Swagger/OpenAPI

---

**Happy Learning! 🚀**

*Remember: Practice makes perfect. Try building different models and CRUD operations to strengthen your understanding!*
