import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import mealRoutes from './routes/meal.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import accessRoutes from './routes/access.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import gameRoutes from './routes/game.routes.js';
// error middleware import placeholder

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/game', gameRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('NutriKid API is running...');
});

// Error Handling (Placeholder integration)
// app.use(errorMiddleware);

export default app;
