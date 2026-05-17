'use strict';

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../modules/users/user.model');
const Workspace = require('../modules/users/workspace.model');
const Product = require('../modules/products/product.model');
const { ROLES } = require('../constants/roles');

const seed = async () => {
  await connectDB();

  const email = 'demo@inventory.ai';
  const existing = await User.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Demo user already exists:', email);
    await disconnectDB();
    return;
  }

  const workspace = await Workspace.create({
    name: 'Demo Cafe',
    industry: 'cafe',
    currency: 'USD',
    settings: { lowStockThreshold: 5, currencySymbol: '$' },
  });

  const passwordHash = await User.hashPassword('Password123!');
  await User.create({
    workspaceId: workspace._id,
    fullName: 'Demo Owner',
    email,
    passwordHash,
    role: ROLES.OWNER,
  });

  const products = [
    { name: 'Cola', unit: 'pcs', price: 1.5, cost: 0.8, stock: 50, category: 'Drinks' },
    { name: 'Ayran', unit: 'pcs', price: 1.2, cost: 0.6, stock: 20, category: 'Drinks' },
    { name: 'Meat', unit: 'kg', price: 12, cost: 8, stock: 10, category: 'Ingredients' },
    { name: 'Bread', unit: 'pcs', price: 0.5, cost: 0.2, stock: 4, category: 'Bakery', lowStockThreshold: 5 },
    { name: 'Milk', unit: 'l', price: 1.0, cost: 0.6, stock: 15, category: 'Dairy' },
  ];

  await Product.insertMany(products.map((p) => ({ ...p, workspaceId: workspace._id })));

  // eslint-disable-next-line no-console
  console.log('Seed complete');
  // eslint-disable-next-line no-console
  console.log('Login: demo@inventory.ai / Password123!');
  await disconnectDB();
};

seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
