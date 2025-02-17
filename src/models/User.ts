import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Prevents password from being returned in queries
  },
  avatar: {
    type: String,
    default: '/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  readingGoal: {
    type: Number,
    default: 50,
    min: [0, 'Reading goal cannot be negative']
  },
  readingStats: {
    totalRead: {
      type: Number,
      default: 0,
      min: [0, 'Total read cannot be negative']
    },
    completed: {
      type: Number,
      default: 0,
      min: [0, 'Completed manga count cannot be negative']
    }
  },
  mangaList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manga'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Prevent re-compilation of the model
export default mongoose.models.User || mongoose.model('User', UserSchema)
