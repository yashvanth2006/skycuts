import Razorpay from 'razorpay';
import crypto from 'crypto';
import Project from '../models/Project.js';

let _razorpay = null;
const getRazorpay = () => {
    if (!_razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID === 'rzp_test_xxxxxxxxx') {
            throw new Error('Razorpay keys are not configured properly in .env');
        }
        _razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpay;
};

// @desc   Create Razorpay Order
// @route  POST /api/payments/create-order/:projectId
export const createOrder = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate('client', 'name email');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (req.user.role === 'client' && project.client._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (project.status === 'paid' || project.paymentStatus === 'CAPTURED') {
            return res.status(400).json({ message: 'This project has already been paid for' });
        }

        // Amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(project.price * 100);
        const currency = 'INR';

        const rzp = getRazorpay();
        const order = await rzp.orders.create({
            amount: amountInPaise,
            currency: currency,
            receipt: `rcpt_${project._id}`,
            notes: {
                projectId: project._id.toString(),
                clientEmail: project.client.email
            }
        });

        // Persist order details
        project.paymentProvider = 'razorpay';
        project.paymentOrderId = order.id;
        project.paymentAmount = project.price; // keep real amount in DB
        project.paymentCurrency = currency;
        project.paymentStatus = 'CREATED';
        await project.save();

        res.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('❌ Failed to create Razorpay order:', err.message);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// @desc   Verify Razorpay Payment Signature
// @route  POST /api/payments/verify
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        const project = await Project.findOne({ paymentOrderId: razorpay_order_id });
        if (!project) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.user.role === 'client' && project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Prevent duplicate verification
        if (project.paymentStatus === 'CAPTURED' && project.status === 'paid') {
            return res.json({ message: 'Payment already verified', success: true });
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment signature verification failed' });
        }

        // Signature valid, update database
        project.paymentId = razorpay_payment_id;
        project.paymentSignature = razorpay_signature;
        project.paymentStatus = 'CAPTURED';
        project.paymentVerifiedAt = new Date();
        project.status = 'paid';
        
        await project.save();
        console.log(`✅ Project ${project._id} marked as PAID via Client Verify`);

        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
        console.error('❌ Verification Error:', err.message);
        res.status(500).json({ message: 'Server error during payment verification' });
    }
};

// @desc   Razorpay Webhook — listens for payment confirmation
// @route  POST /api/payments/webhook  (raw body required!)
export const webhookHandler = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature using the raw body
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('❌ Razorpay webhook signature mismatch');
            return res.status(400).send('Invalid signature');
        }

        // Since req.body is raw buffer here (because of express.raw), we need to parse it to JSON
        const event = JSON.parse(req.body.toString('utf8'));

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;

            const project = await Project.findOne({ paymentOrderId: orderId });
            
            if (!project) {
                console.error(`❌ Webhook Error: Project with order ${orderId} not found`);
                return res.status(404).send('Project not found');
            }

            // If already captured by client verify, just log it and ignore
            if (project.paymentStatus !== 'CAPTURED') {
                project.paymentId = paymentId;
                project.paymentStatus = 'CAPTURED';
                project.paymentVerifiedAt = new Date();
                project.status = 'paid';
                await project.save();
                console.log(`✅ Project ${project._id} marked as PAID via Razorpay webhook`);
            } else {
                console.log(`✅ Webhook received but project ${project._id} was already marked as PAID`);
            }
        }

        res.status(200).json({ received: true });
    } catch (err) {
        console.error('❌ Webhook processing error:', err.message);
        res.status(500).send('Webhook Error');
    }
};
