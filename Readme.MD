# MoMo Data Analysis Dashboard

This project is a full-stack web application that provides visual analytics for mobile money transactions. Users can view insights such as total transactions, transaction volume by type, monthly trends, and perform filtered searches of their financial activity.

## Live Demo Link

https://youtu.be/RYxYdA_5Ngk



## Features

- Transaction volume visualized by type (Bar Chart)
- Monthly trends and totals (Line Chart)
- Distribution of transaction types (Pie Chart)
- Summary cards: Total Transactions, Total Amount, Money In, Money Out
- Search and filter by transaction type and keyword
- Responsive design with clean UI
- Backend data fetching from PostgreSQL database



## Technologies Used

### Frontend

- HTML, CSS
-  JavaScript
- Chart.js (for graphs)
- Responsive layout (CSS Grid, Flexbox)

### Backend

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client for Node.js)

### Tools

- Postman (for testing API routes)
- Onrender (Hosting both Frontend and Backend)

---

## Folder Structure

MOMO-DATA-ANALYSIS/
│
├── backend/
│   ├── controller/
│   │   ├── authcontroller.js
│   │   └── transactioncontroller.js
│   ├── data/
│   │   └── modified-sms.xml
│   ├── middlewares/
│   │   └── authmiddleware.js
│   ├── routes/
│   │   ├── authroutes.js
│   │   └── transactions.js
│   ├── services/
│   │   ├── authservices.js
│   │   └── transactionservices.js
│   ├── data.js          # for inserting parsed data into PostgreSQL
│   ├── db.js            # PostgreSQL connection
│   ├── parse-xml.js     # XML parser
│   └── server.js        # Starts the backend API
│
├── public/
│   ├── chart.js         # Chart rendering logic
│   ├── index.js         # Filter/search/rendering logic
│   ├── index.css        # Full styling
│   └── index.html       # UI structure
│
├── .env
├── .gitignore
├── momo_schema.sql      
├── package.json
├── package-lock.json
└── README.md            


## How to Run the Project

### 1. Backend Setup

1. Navigate to the backend directory:

           cd backend

2. Install dependencies

3. Configure your PostgreSQL database credentials in db.js:

 const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'momo',
  password: 'your_password',
  port: 5432,
 });


4. Insert data into the database:

node  data.js
   (This will create a transactions table (if it doesn’t exist) and insert cleaned transaction data into it.)

5. Start The server

node server.js

6. Confirm it's running:

Open Postman or your browser and visit:

http://localhost:3000/api/transactions


### 1. Frontend Setup
1. Navigate to the public/ directory or open index.html in your browser.

2. Ensure the backend server is running.

3. You’ll see:

- Summary stats

- Charts for analytics

- Search and filter inputs

- Responsive UI layout

## Notes
- All data is stored in PostgreSQL under a single table: transactions

- API endpoint: GET /api/transactions returns all transaction data as JSON

- Filtering is handled on the frontend (index.js)

- Charts dynamically update based on available data

# Author

Developed by: Ineza Gisubizo Bonae
Date: June 2025
