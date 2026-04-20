import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to DB');

    // The User schema has a pre-save hook that hashes the password automatically!
    // So we don't need to manually hash it.
    
    // Check if the user already exists
    let admin = await User.findOne({ username: 'Admin' });

    if (admin) {
      console.log('Admin already exists. Updating password and role...');
      admin.password = 'Toshan@0001';
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin updated successfully!');
    } else {
      admin = new User({
        username: 'Admin',
        email: 'admin@blogy.dev',
        fullName: 'Admin',
        password: 'Toshan@0001',
        role: 'admin',
      });
      await admin.save();
      console.log('✅ Admin created successfully!');
    }

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
