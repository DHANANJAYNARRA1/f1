import express from 'express';
import { isAuthenticated, isAdmin, isSuperadmin } from '../auth';
import Product from '../models/Product';
import InterestForm from '../models/InterestForm';
import User from '../models/User';
import { nanoid } from 'nanoid';
import { Request, Response } from 'express';

const router = express.Router();

// Founder: Add a new product
router.post('/products', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can add products.' });
    }
    try {
        const { name, category, useCase, problemStatement, solutionDescription } = req.body;
        const founder = req.user!;

        const product = new Product({
            name,
            founderId: founder._id,
            founderUniqueId: founder.uniqueId,
            anonymousId: `Product by Founder #${founder.uniqueId}`,
            category,
            useCase,
            problemStatement,
            solutionDescription,
            // Add other required fields from your model with defaults or from req.body
            stage: 'concept', // Example default
            fundingRequired: 0, // Example default
        });
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to add product.', message: error.message });
    }
});

// Investor: Browse products (anonymously)
router.get('/products', isAuthenticated, async (req, res) => {
     if (req.user!.role !== 'investor') {
        return res.status(403).json({ error: 'Only investors can browse products.' });
    }
    try {
        const products = await Product.find({ status: 'approved' }).select('anonymousId category useCase');
        res.json({ success: true, products });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch products.', message: error.message });
    }
});

// Investor: Express interest in a product
router.post('/interest-forms', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'investor') {
        return res.status(403).json({ error: 'Only investors can express interest.' });
    }
    try {
        const { productId, messageFromInvestor } = req.body;
        const investor = req.user!;

        // Find the product to get the founder's ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const interestForm = new InterestForm({
            productId,
            investorId: investor._id,
            founderId: product.founderId,
            messageFromInvestor,
        });

        await interestForm.save();

        // TODO: Emit socket.io event 'interest-submitted' to notify admin in real-time
        // req.app.get('io').to('admin_room').emit('interest-submitted', { form: interestForm });

        res.status(201).json({ success: true, interestForm });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to express interest.', message: error.message });
    }
});

// Admin: Get all interest forms for review
router.get('/interest-forms/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const forms = await InterestForm.find({ status: 'pending-admin-review' })
            .populate('productId', 'name anonymousId')
            .populate('investorId', 'anonymousId');
        res.json({ success: true, forms });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch interest forms.', message: error.message });
    }
});

// Admin: Forward interest form to founder
router.put('/interest-forms/admin/:formId/forward', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { formId } = req.params;
        const { adminToFounderMessage } = req.body;

        const form = await InterestForm.findByIdAndUpdate(
            formId,
            {
                status: 'pending-founder-response',
                adminReviewed: true,
                adminToFounderMessage,
            },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'Interest form not found.' });
        }

        // TODO: Emit socket.io event 'form-reviewed' or 'response-request' to notify founder
        // req.app.get('io').to(form.founderId.toString()).emit('response-request', { form });

        res.json({ success: true, form });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to forward form.', message: error.message });
    }
});

// Founder: Get interest forms pending response
router.get('/interest-forms/founder', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can view their requests.' });
    }
    try {
        const forms = await InterestForm.find({
            founderId: req.user!._id,
            status: 'pending-founder-response'
        })
        .populate('productId', 'name')
        .populate('investorId', 'anonymousId');

        res.json({ success: true, forms });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch interest forms.', message: error.message });
    }
});

// Founder: Respond to an interest form
router.put('/interest-forms/founder/:formId/respond', isAuthenticated, async (req, res) => {
    if (req.user!.role !== 'founder') {
        return res.status(403).json({ error: 'Only founders can respond to forms.' });
    }
    try {
        const { formId } = req.params;
        const { founderResponse } = req.body;

        const form = await InterestForm.findOneAndUpdate(
            { _id: formId, founderId: req.user!._id },
            {
                status: 'founder-responded',
                founderResponse,
            },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'Form not found or you do not have permission to respond.' });
        }

        // TODO: Emit socket.io event 'founder-response' to notify admin
        // req.app.get('io').to('admin_room').emit('founder-response', { form });

        res.json({ success: true, form });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to submit response.', message: error.message });
    }
});

// Admin: Finalize and forward founder response to investor
router.put('/interest-forms/admin/:formId/finalize', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { formId } = req.params;
        const { adminToInvestorMessage, finalStatus } = req.body; // finalStatus: 'closed-accepted' or 'closed-rejected'

        const form = await InterestForm.findByIdAndUpdate(
            formId,
            {
                status: finalStatus,
                adminToInvestorMessage,
            },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'Form not found.' });
        }

        // TODO: Emit event to notify investor of the final update
        // req.app.get('io').to(form.investorId.toString()).emit('form-update', { form });

        res.json({ success: true, form });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to finalize form.', message: error.message });
    }
});

// Superadmin: Get all interest forms
router.get('/interest-forms/superadmin/all', isAuthenticated, isSuperadmin, async (req, res) => {
    try {
        const forms = await InterestForm.find({})
            .populate('productId', 'name anonymousId')
            .populate('investorId', 'anonymousId email')
            .populate('founderId', 'anonymousId email');
        res.json({ success: true, forms });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch all forms.', message: error.message });
    }
});

export const getProductsByFounder = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const products = await Product.find({ founderId: req.user._id });
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products by founder:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getInterestsByInvestor = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.userType !== 'investor') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const interests = await InterestForm.find({ investorId: req.user.id });
        const productIds = interests.map(interest => interest.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching interests by investor:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export default router;