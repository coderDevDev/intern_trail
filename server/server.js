import evaluationsRouter from './routes/evaluations.js';
import certificatesRouter from './routes/certificates.js';
import emergencyReportsRouter from './routes/emergency-reports.js';
import systemLogsRouter from './routes/system-logs.js';

// Routes
// ... existing routes
app.use('/evaluations', evaluationsRouter);
app.use('/certificates', certificatesRouter);
app.use('/emergency-reports', emergencyReportsRouter);
app.use('/api/system-logs', systemLogsRouter);

// ... rest of the file
