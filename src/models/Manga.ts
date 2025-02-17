import mongoose from 'mongoose'

const MangaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a manga title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a manga description']
  },
  coverImage: {
    type: String,
    default: '/default-manga-cover.jpg'
  },
  genres: [{
    type: String,
    enum: [
      'Action', 'Adventure', 'Comedy', 'Drama', 
      'Fantasy', 'Horror', 'Mystery', 
      'Romance', 'Sci-Fi', 'Slice of Life', 
      'Sports', 'Supernatural'
    ]
  }],
  status: {
    type: String,
    enum: ['Ongoing', 'Completed', 'Hiatus'],
    default: 'Ongoing'
  },
  latestChapter: {
    number: {
      type: Number,
      default: 1
    },
    releaseDate: {
      type: Date,
      default: Date.now
    }
  },
  totalChapters: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create index for sorting and searching
MangaSchema.index({ 
  'latestChapter.releaseDate': -1, 
  createdAt: -1 
})

export default mongoose.models.Manga || mongoose.model('Manga', MangaSchema)
