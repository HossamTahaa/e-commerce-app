const mongoose = require('mongoose');
const slugifyPlugin = require('../utils/slugifyPlugin');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [3, 'Too short user name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'User phone is required'],
      unique: true,
    },
    profileImage: String,
    password: {
      type: String,
      required: [true, 'User password is required'],
      minlength: [6, 'Too short user password'],
      // select: false, // never show password in any response
    },
    // when the password last changed (used later to reject old login tokens)
    passwordChangedAt: Date,
    // forgot password: hashed 6-digit code, when it expires, and if it was verified
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user',
    },
    active: {
      type: Boolean,
      default: true,},
  },
  { timestamps: true },
);

// slug from the name, like categories and brands
userSchema.plugin(slugifyPlugin, { from: 'name' });

// hash the password before saving it
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
 
module.exports = mongoose.model('User', userSchema);
