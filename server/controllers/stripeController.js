import Stripe from 'stripe';
import Project from '../models/Project.js';

// Lazily initialize Stripe so the server can boot without real keys
let _stripe = null;
const getStripe = () => {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_REPLACE_ME') {
            throw new Error('STRIPE_SECRET_KEY is not configured in .env');
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return _stripe;
};

// @desc   Create Stripe Checkout Session
// @route  POST /api/stripe/checkout/:projectId
export const createCheckoutSession = async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate('client', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
    }

    if (project.status === 'paid') {
        return res.status(400).json({ message: 'This project has already been paid for' });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `SkyCuts — ${project.title}`,
                        description: 'Video editing & delivery by SkyCuts Studio',
                    },
                    unit_amount: Math.round(project.price * 100), // in cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/dashboard/project/${projectId}?payment=success`,
        cancel_url: `${process.env.CLIENT_URL}/dashboard/project/${projectId}?payment=cancelled`,
        metadata: { projectId: projectId.toString() },
        customer_email: project.client.email,
    });

    // Persist session ID for webhook verification
    project.stripeSessionId = session.id;
    await project.save();

    res.json({ sessionUrl: session.url });
};

// @desc   Stripe Webhook — listens for payment confirmation
// @route  POST /api/stripe/webhook  (raw body required!)
export const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('❌ Stripe webhook verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { projectId } = session.metadata;

        try {
            await Project.findByIdAndUpdate(projectId, { status: 'paid' });
            console.log(`✅ Project ${projectId} marked as PAID via Stripe webhook`);
        } catch (err) {
            console.error('❌ Failed to update project status:', err.message);
        }
    }

    res.json({ received: true });
};
