import mongoose, { Document, Schema } from 'mongoose'

export interface IArticle extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  category: 'politics' | 'social-justice' | 'labor' | 'environment' | 'economy' | 'healthcare' | 'education' | 'technology'
  tags: string[]
  author: string
  featuredImage?: string
  published: boolean
  featured: boolean

  sourceUrl?: string
  sourceTitle?: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  views: number
  likes: number
  // New fields for enhanced customization
  metaDescription?: string
  readingTime?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  socialTitle?: string
  socialDescription?: string
  enableComments: boolean
  enableNewsletter: boolean
  customCSS?: string
  customJS?: string
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
    enum: ['politics', 'social-justice', 'labor', 'environment', 'economy', 'healthcare', 'education', 'technology']
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

  sourceUrl: {
    type: String
  },
  sourceTitle: {
    type: String
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
  },
  // New enhanced fields
  metaDescription: {
    type: String,
    maxlength: 160
  },
  readingTime: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  socialTitle: {
    type: String,
    maxlength: 60
  },
  socialDescription: {
    type: String,
    maxlength: 160
  },
  enableComments: {
    type: Boolean,
    default: true
  },
  enableNewsletter: {
    type: Boolean,
    default: true
  },
  customCSS: {
    type: String
  },
  customJS: {
    type: String
  }
}, {
  timestamps: true
})

// Index for better query performance
ArticleSchema.index({ category: 1, published: 1, publishedAt: -1 })
ArticleSchema.index({ featured: 1, published: 1, publishedAt: -1 })
ArticleSchema.index({ slug: 1 })

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)