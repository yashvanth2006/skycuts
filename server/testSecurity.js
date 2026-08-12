import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { io } from 'socket.io-client';
import dns from 'dns';
dns.setServers(['8.8.8.8','8.8.4.4']);

dotenv.config();

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

// We need User and Project models
import User from './models/User.js';
import Project from './models/Project.js';

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB for testing');

  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({ name: 'Admin', email: 'admin@skycuts.io', password: 'password123', role: 'admin' });
  }

  let clients = await User.find({ role: 'client' }).limit(2);
  if (clients.length < 2) {
    await User.create({ name: 'Client A', email: `client_a_${Date.now()}@test.com`, password: 'password123', role: 'client' });
    await User.create({ name: 'Client B', email: `client_b_${Date.now()}@test.com`, password: 'password123', role: 'client' });
    clients = await User.find({ role: 'client' }).limit(2);
  }

  const clientA = clients[0];
  const clientB = clients[1];

  let projectA = await Project.findOne({ client: clientA._id });
  let projectB = await Project.findOne({ client: clientB._id });

  // Create fake projects if they don't exist
  if (!projectA) {
    projectA = await Project.create({ client: clientA._id, title: 'Project A', status: 'awaiting_assets', tier: 'Standard', deliveryDays: 3, price: 50 });
  }
  if (!projectB) {
    projectB = await Project.create({ client: clientB._id, title: 'Project B', status: 'awaiting_assets', tier: 'Standard', deliveryDays: 3, price: 50 });
  }

  const tokenAdmin = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const tokenA = jwt.sign({ userId: clientA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ userId: clientB._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 1. Backend Stability Tests
  console.log('\n--- REST API Security & Stability Testing ---');

  async function testApi(name, headers, expectedStatus) {
    try {
      const response = await fetch(`${API_URL}/projects`, { headers });
      if (response.status === expectedStatus) {
        console.log(`✅ [REST] ${name} returned expected Status: ${response.status}`);
      } else {
        console.log(`❌ [REST] ${name} returned Status: ${response.status} (Expected: ${expectedStatus})`);
      }
    } catch (err) {
      console.log(`❌ [REST] ${name} request error: ${err.message}`);
    }
  }

  // A. No Authorization header -> 401
  await testApi('No Authorization header', {}, 401);

  // B. Malformed Authorization header -> 401
  await testApi('Malformed Authorization header', { Authorization: 'Bearer' }, 401);

  // C. Invalid JWT -> 401
  await testApi('Invalid JWT', { Authorization: 'Bearer this_is_invalid' }, 401);

  // D. Expired JWT -> 401
  const expiredToken = jwt.sign({ userId: clientA._id }, process.env.JWT_SECRET, { expiresIn: '-10s' });
  await testApi('Expired JWT', { Authorization: `Bearer ${expiredToken}` }, 401);

  // E. Valid JWT but deleted/nonexistent user -> 401
  const fakeId = new mongoose.Types.ObjectId();
  const nonexistentToken = jwt.sign({ userId: fakeId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  await testApi('Deleted user JWT', { Authorization: `Bearer ${nonexistentToken}` }, 401);

  // F. Valid client JWT requesting another client's project -> 403
  async function testApiScoped(name, token, projectId, expectedStatus) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === expectedStatus) {
        console.log(`✅ [REST] ${name} returned expected Status: ${response.status}`);
      } else {
        console.log(`❌ [REST] ${name} returned Status: ${response.status} (Expected: ${expectedStatus})`);
      }
    } catch (err) {
      console.log(`❌ [REST] ${name} request error: ${err.message}`);
    }
  }

  await testApiScoped("Client A requesting Client B's project", tokenA, projectB._id, 403);

  // G. Valid client JWT requesting their own project -> 200
  await testApiScoped("Client A requesting their own project", tokenA, projectA._id, 200);

  // H. Valid admin JWT requesting projects -> 200
  await testApi('Admin requesting all projects', { Authorization: `Bearer ${tokenAdmin}` }, 200);

  // I. Valid admin JWT requesting any project -> 200
  await testApiScoped("Admin requesting Client A's project", tokenAdmin, projectA._id, 200);

  // 2. Authentication Login Tests (Bcrypt Fix)
  console.log('\n--- Login Authentication Tests (Bcrypt Fix) ---');
  async function testLogin(name, email, password, expectedStatus) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.status === expectedStatus) {
        console.log(`✅ [Login] ${name} returned expected Status: ${response.status}`);
      } else {
        console.log(`❌ [Login] ${name} returned Status: ${response.status} (Expected: ${expectedStatus})`);
      }
    } catch (err) {
      console.log(`❌ [Login] ${name} request error: ${err.message}`);
    }
  }

  // Create a mock Google user with NO password
  let googleUser = await User.findOne({ email: 'google@skycuts.io' });
  if (!googleUser) {
    googleUser = await User.create({
      name: 'Google User',
      email: 'google@skycuts.io',
      googleId: '123456789',
      role: 'client'
    });
  }

  // Create a mock normal user for valid login test
  let loginUser = await User.findOne({ email: 'testlogin@skycuts.io' });
  if (!loginUser) {
    loginUser = await User.create({
      name: 'Test Login User',
      email: 'testlogin@skycuts.io',
      password: 'TestPassword123!',
      role: 'client'
    });
  } else {
    // Ensure password is correct for tests
    loginUser.password = 'TestPassword123!';
    await loginUser.save();
  }

  // Tests
  await testLogin('Normal user + correct password', 'testlogin@skycuts.io', 'TestPassword123!', 200);
  await testLogin('Normal user + wrong password', 'testlogin@skycuts.io', 'wrongpassword', 401);
  await testLogin('Google-only user + email/password login', 'google@skycuts.io', 'anypassword', 401);
  await testLogin('Nonexistent email', 'nobody@skycuts.io', 'password', 401);
  await testLogin('Missing password (empty string)', 'testlogin@skycuts.io', '', 401);

  console.log('\nAll tests completed.');
  process.exit(0);
}

runTests();
