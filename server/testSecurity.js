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

  // 1. REST API Security Test
  console.log('\n--- REST API Security Testing ---');

  async function testApi(name, token, projectId, shouldSucceed) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.ok) {
        if (shouldSucceed) console.log(`✅ [REST] ${name} accessed project ${projectId} (Success)`);
        else console.log(`❌ [REST] ${name} INCORRECTLY accessed project ${projectId}`);
      } else {
        if (!shouldSucceed && [403, 401, 404].includes(response.status)) {
          console.log(`✅ [REST] ${name} denied access to project ${projectId} (Status: ${response.status})`);
        } else {
          console.log(`❌ [REST] ${name} failed unexpectedly: HTTP ${response.status}`);
        }
      }
    } catch (err) {
      console.log(`❌ [REST] ${name} request error: ${err.message}`);
    }
  }

  await testApi('Client A', tokenA, projectA._id, true);
  await testApi('Client A', tokenA, projectB._id, false);
  await testApi('Client B', tokenB, projectB._id, true);
  await testApi('Client B', tokenB, projectA._id, false);
  await testApi('Admin', tokenAdmin, projectA._id, true);
  await testApi('Admin', tokenAdmin, projectB._id, true);

  // 2. Socket.io Security Test
  console.log('\n--- Socket.io Security Testing ---');

  function testSocket(name, token, projectId, shouldSucceed) {
    return new Promise((resolve) => {
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token }
      });

      let resolved = false;

      socket.on('connect', () => {
        socket.emit('join_project', projectId);
      });

      // To verify success, there's no native success callback, we wait 1 sec.
      const timeout = setTimeout(() => {
        if (!resolved) {
          if (shouldSucceed) console.log(`✅ [Socket] ${name} joined room ${projectId}`);
          else console.log(`❌ [Socket] ${name} INCORRECTLY joined room ${projectId} (no error emitted)`);
          socket.disconnect();
          resolve();
        }
      }, 1000);

      socket.on('socket_error', (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (!shouldSucceed) {
            console.log(`✅ [Socket] ${name} denied room ${projectId} (Error: ${err.message})`);
          } else {
            console.log(`❌ [Socket] ${name} failed to join room ${projectId} (Error: ${err.message})`);
          }
          socket.disconnect();
          resolve();
        }
      });
    });
  }

  await testSocket('Client A', tokenA, projectA._id, true);
  await testSocket('Client A', tokenA, projectB._id, false);
  await testSocket('Client B', tokenB, projectB._id, true);
  await testSocket('Client B', tokenB, projectA._id, false);
  await testSocket('Admin', tokenAdmin, projectA._id, true);
  await testSocket('Admin', tokenAdmin, projectB._id, true);

  // Also test Unauthenticated Socket
  await new Promise((resolve) => {
    const unauthSocket = io(SOCKET_URL, { transports: ['websocket'] });
    let errorCaught = false;
    unauthSocket.on('connect_error', (err) => {
      console.log(`✅ [Socket] Unauthenticated socket blocked (Error: ${err.message})`);
      errorCaught = true;
      unauthSocket.disconnect();
      resolve();
    });
    setTimeout(() => {
      if (!errorCaught) {
        console.log(`❌ [Socket] Unauthenticated socket connected!`);
        unauthSocket.disconnect();
        resolve();
      }
    }, 1000);
  });

  console.log('\nAll tests completed.');
  process.exit(0);
}

runTests();
