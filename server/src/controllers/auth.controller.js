import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if(password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic: profilePic || "",
    });

    // Save user to database
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Send response with token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    // Return user info without password
    const { password: userPassword, ...userWithoutPassword } = newUser._doc;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
}

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate that user.password exists
    if (!user.password) {
      console.error('User found but password is missing in the database');
      return res.status(500).json({ error: 'Server error during signin' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Send response with token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    // Return user info without password
    const { password: userPassword, ...userWithoutPassword } = user._doc;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
}

export const signout = (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', { 
      httpOnly: true, 
      expires: new Date(0),
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Server error during signout' });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;
    if(!profilePic) {
      return res.status(400).json({ error: 'Profile picture is required' });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: 'chat-app/profilePics'
    });
    const updateUser = await User.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url
    }, { new: true });
    res.status(200).json(updateUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
}

export const getProfile = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error during get profile' });
  }
}