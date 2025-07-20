import mongoose, { Document, Schema } from 'mongoose'

export interface IArticle extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  category: 'politics' | 'social-justice' | 'labor'
  tags: string[]
  author: string
  featuredImage?: string
  published: boolean
  featured: boolean
  aiGenerated: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  views: number
  likes: number
}

const ArticleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  category: {
    type: String,
    required: true,
    enum: ['politics', 'social-justice', 'labor']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: true,
    default: 'Progressive Voice Editorial Team'
  },
  featuredImage: {
    type: String
  },
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for better query performance
ArticleSchema.index({ category: 1, published: 1, publishedAt: -1 })
ArticleSchema.index({ featured: 1, published: 1, publishedAt: -1 })
ArticleSchema.index({ slug: 1 })

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)