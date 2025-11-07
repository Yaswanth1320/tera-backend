import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import overviewRoutes from "./routes/overviewRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import sentimentRoutes from "./routes/sentimentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoute from "./routes/aiRoutes.js";

dotenv.config();

// CLI Logging Helpers
const log = {
  info: (msg) => console.log(`\n📘 [INFO] ${msg}`),
  success: (msg) => console.log(`\n✅ [SUCCESS] ${msg}`),
  error: (msg) => console.error(`\n❌ [ERROR] ${msg}`),
  warn: (msg) => console.warn(`\n⚠️  [WARN] ${msg}`),
  step: (msg) => console.log(`  → ${msg}`),
  divider: () => console.log('─'.repeat(50)),
};

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/overview", overviewRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/sentiment", sentimentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoute);


// Connect to MongoDB before starting server
const startServer = async () => {
  try {
    log.divider();
    log.info('Starting Terraform Backend Server...');
    log.divider();
    
    // Check environment variables
    log.step('Checking environment variables...');
    const PORT = process.env.PORT || 5000;
    const hasMongoURI = !!process.env.MONGODB_URI;
    
    if (!hasMongoURI) {
      log.warn('MONGODB_URI not found in .env file');
    } else {
      log.success(`Environment variables loaded (PORT: ${PORT})`);
    }
    
    // Connect to MongoDB
    log.step('Connecting to MongoDB...');
    const dbConnection = await connectDB();
    const dbHost = dbConnection.connection.host;
    const dbName = dbConnection.connection.name;
    log.success(`MongoDB connected to ${dbHost}/${dbName}`);
    
    // Start server
    log.step(`Starting Express server on port ${PORT}...`);
    app.listen(PORT, () => {
      log.divider();
      log.success(`🚀 Server is running successfully!`);
      log.info(`   Port: ${PORT}`);
      log.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      log.info(`   MongoDB: ${dbHost}/${dbName}`);
      log.divider();
      console.log(`\n   👉 Server ready at http://localhost:${PORT}\n`);
    });
  } catch (error) {
    log.divider();
    log.error('Failed to start server');
    log.step(`Error: ${error.message}`);
    log.divider();
    console.error('\nStack trace:', error);
    process.exit(1);
  }
};

startServer();