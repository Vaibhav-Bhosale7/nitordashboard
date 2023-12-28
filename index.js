const express = require('express');
const connectDB = require('./db');
const projectRoutes = require('./routes/project');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Parse JSON request body
app.use(express.json());

// Define project routes
app.use('/project', projectRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});