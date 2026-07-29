import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'client' });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export const seedEditor = async (req, res) => {
    const editorExists = await User.findOne({ role: 'admin' });

    if (editorExists) {
        return res.status(400).json({ message: 'Editor account already exists' });
    }

    const editor = await User.create({
        name: 'Yashvanth',
        email: 'yashvanth@skycuts.io',
        password: 'yash2468',
        role: 'admin'
    });

    res.status(201).json({ message: 'Editor user successfully created!', editor });
};