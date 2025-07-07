import type { Express, Request, Response } from "express";
import { setupAuth, isAuthenticated, isAdmin, uploadFounderDocuments, verifyUser, verifyUserDocument } from "./auth";
import matchmakingRouter, {
    getProductsByFounder,
    getInterestsByInvestor,
} from './routes/matchmaking';
import queryRoutes from './routes/query';
import { createMentorCommunication, getMentorCommunicationsForUser } from "./communicationService";
import { storage } from './storage';
import { registerFounderWithDocuments } from './registerFounderWithDocuments';

// TODO: These handlers' logic needs to be implemented.
const handleCommunicationRequest = (req: Request, res: Response) => res.status(501).send("Not Implemented");
const getCommunicationRequests = (req: Request, res: Response) => res.status(501).send("Not Implemented");
const updateRequestStatus = (req: Request, res: Response) => res.status(501).send("Not Implemented");


export const registerRoutes = (app: Express) => {

    setupAuth(app);

    // Main routers
    app.use('/api/matchmaking', matchmakingRouter);
    app.use('/api/queries', queryRoutes);

    // Standalone routes
    app.post('/api/auth/register-founder', registerFounderWithDocuments);
    app.post('/api/auth/founder-documents', uploadFounderDocuments);
    app.get('/api/products/founder', isAuthenticated, getProductsByFounder);
    app.get('/api/investor/interests', isAuthenticated, getInterestsByInvestor);
    app.get('/api/users/admins', isAuthenticated, isAdmin, (req: Request, res: Response) => {
        storage.getAdmins().then(admins => res.json({ success: true, admins }));
    });

    // Communication routes
    app.post('/api/communication/request', isAuthenticated, handleCommunicationRequest);
    app.get('/api/communication/requests', isAuthenticated, getCommunicationRequests);
    app.put('/api/communication/request/:id/status', isAuthenticated, isAdmin, updateRequestStatus);
    app.post('/api/communication/mentor', isAuthenticated, createMentorCommunication);
    app.get('/api/communication/mentor', isAuthenticated, getMentorCommunicationsForUser);

    // Generic user route
    app.get('/api/user', (req: Request, res: Response) => {
        if (req.user) {
            res.json({ success: true, user: req.user });
        } else {
            res.status(401).json({ success: false, message: 'Not authenticated' });
        }
    });

    app.put('/api/admin/users/:userId/verify', isAuthenticated, isAdmin, verifyUser);
    app.put('/api/admin/users/:userId/documents/:docKey/verify', isAuthenticated, isAdmin, verifyUserDocument);
};

