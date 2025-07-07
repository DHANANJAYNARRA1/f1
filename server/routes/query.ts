import express from 'express';
import { isAuthenticated, isAdmin } from '../auth';
import Product from '../models/Product';
import Query from '../models/Query';
import User from '../models/User';

const router = express.Router();

// 1. FOUNDER ADDS PRODUCT
router.post('/founder/add-product', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can add products.' });
    }
    try {
        const { name, category, useCase, description, stage, fundingRequired } = req.body;
        const product = new Product({
            name,
            founderId: req.user!._id,
            category,
            useCase,
            description,
            stage,
            fundingRequired,
            status: 'pending',
        });
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add product.', message: error.message });
    }
});

// 2. FOUNDER GETS THEIR PRODUCTS
router.get('/founder/my-products', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can view their products.' });
    }
    try {
        const products = await Product.find({ founderId: req.user!._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch products.', message: error.message });
    }
});

// 3. INVESTOR BROWSEES PRODUCTS
router.get('/investor/products', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'investor') {
        return res.status(403).json({ error: 'Only investors can browse products.' });
    }
    try {
        const products = await Product.find({ status: 'approved' })
            .select('name category useCase description anonymousId')
            .sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch products.', message: error.message });
    }
});

// 4. INVESTOR EXPRESSES INTEREST
router.post('/investor/express-interest', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'investor') {
        return res.status(403).json({ error: 'Only investors can express interest.' });
    }
    try {
        const { productId, primaryIntent, areasOfInterest, originalQuestion } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        const query = new Query({
            productId,
            investorId: req.user!._id,
            founderId: product.founderId,
            investorPrimaryIntent: primaryIntent,
            investorAreasOfInterest: areasOfInterest,
            investorOriginalQuestion: originalQuestion,
            status: 'investor_queries_submitted',
        });
        await query.save();

        // Emit real-time notification to admin
        if (req.app.get('io')) {
            req.app.get('io').to('admin').emit('investor-interest-submitted', { query });
        }

        res.status(201).json({ success: true, query });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create query.', message: error.message });
    }
});

// 5. INVESTOR GETS THEIR INTERESTS
router.get('/investor/my-interests', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'investor') {
        return res.status(403).json({ error: 'Only investors can view their interests.' });
    }
    try {
        const queries = await Query.find({ investorId: req.user!._id })
            .populate('productId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, queries });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch interests.', message: error.message });
    }
});

// 6. ADMIN RECEIVES & FORWARDS REQUEST
router.get('/admin/investor-requests', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const requests = await Query.find({ status: 'investor_queries_submitted' })
            .populate('productId', 'name anonymousId')
            .populate('investorId', 'anonymousId');
        res.json({ success: true, requests });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch investor requests.', message: error.message });
    }
});

// 7. ADMIN REVIEWS AND FORWARDS TO FOUNDER
router.post('/admin/send-to-founder/:queryId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { queryId } = req.params;
        const { approvedText } = req.body;
        const query = await Query.findByIdAndUpdate(
            queryId, 
            { 
                status: 'investor_queries_approved', 
                investorQueryStatus: 'admin-approved',
                investorQueryAdminApprovedText: approvedText
            }, 
            { new: true }
        ).populate('founderId', 'uniqueId');
        
        if (!query) return res.status(404).json({ error: 'Query not found.' });
        
        // Emit real-time notification to founder
        if (req.app.get('io') && query.founderId && typeof query.founderId === 'object' && 'uniqueId' in query.founderId) {
            req.app.get('io').to((query.founderId as any).uniqueId).emit('investor-query-approved', { query });
        }
        
        res.json({ success: true, query });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to send to founder.', message: error.message });
    }
});

// 8. FOUNDER RECEIVES & RESPONDS
router.get('/founder/responses', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can view these requests.' });
    }
    try {
        const requests = await Query.find({ 
            founderId: req.user!._id,
            status: 'investor_queries_approved'
        })
        .populate('productId', 'name')
        .populate('investorId', 'anonymousId');
        res.json({ success: true, requests });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch requests.', message: error.message });
    }
});

router.post('/founder/respond-to-request', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can respond.' });
    }
    try {
        const { queryId, founderSelectedTopics, founderOriginalQuestion } = req.body;
        const query = await Query.findOneAndUpdate(
            { _id: queryId, founderId: req.user!._id },
            { 
                founderSelectedTopics,
                founderOriginalQuestion,
                founderQueryStatus: 'submitted',
                status: 'founder_questions_submitted'
            },
            { new: true }
        );
        if (!query) return res.status(404).json({ error: 'Query not found or permission denied.' });
        
        // Emit real-time notification to admin
        if (req.app.get('io')) {
            req.app.get('io').to('admin').emit('founder-response-submitted', { query });
        }
        
        res.json({ success: true, query });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to submit response.', message: error.message });
    }
});

// 9. ADMIN REVIEWS FOUNDER'S RESPONSE
router.get('/admin/founder-responses', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const responses = await Query.find({ status: 'founder_questions_submitted' })
            .populate('productId', 'name')
            .populate('investorId', 'anonymousId')
            .populate('founderId', 'anonymousId verificationStatus');
        res.json({ success: true, responses });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch founder responses.', message: error.message });
    }
});

// 10. ADMIN APPROVES AND SENDS TO INVESTOR
router.post('/admin/approve-founder-response/:queryId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { queryId } = req.params;
        const { approvedText } = req.body;
        const query = await Query.findByIdAndUpdate(
            queryId,
            {
                founderQueryStatus: 'admin-approved',
                founderQueryAdminApprovedText: approvedText,
                status: 'founder_questions_approved'
            },
            { new: true }
        ).populate('investorId', 'uniqueId');
        
        if (!query) return res.status(404).json({ error: 'Query not found.' });
        
        // Emit real-time notification to investor
        if (req.app.get('io') && query.investorId && typeof query.investorId === 'object' && 'uniqueId' in query.investorId) {
            req.app.get('io').to((query.investorId as any).uniqueId).emit('founder-response-approved', { query });
        }
        
        res.json({ success: true, query });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to approve response.', message: error.message });
    }
});

// 11. ADMIN REVIEWS INVESTOR REQUESTS (for ReviewQueriesSection)
router.get('/admin/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const requests = await Query.find({ status: 'investor_queries_submitted' })
            .populate('productId', 'name anonymousId')
            .populate('investorId', 'anonymousId')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch pending requests.', message: error.message });
    }
});

// 12. ADMIN APPROVES INVESTOR REQUEST
router.post('/admin/approve', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { queryId, approvedText } = req.body;
        const query = await Query.findByIdAndUpdate(
            queryId,
            {
                status: 'investor_queries_approved',
                investorQueryStatus: 'admin-approved',
                investorQueryAdminApprovedText: approvedText
            },
            { new: true }
        );
        if (!query) return res.status(404).json({ error: 'Query not found.' });
        res.json({ success: true, query });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to approve request.', message: error.message });
    }
});

export default router;
