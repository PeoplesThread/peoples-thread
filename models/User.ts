import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  name: string
  role: 'admin' | 'editor' | 'writer'
  bio?: string
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  permissions: {
    canCreateArticles: boolean
    canEditOwnArticles: boolean
    canEditAllArticles: boolean
    canDeleteArticles: boolean
    canManageUsers: boolean
    canPublishArticles: boolean
    canManageSettings: boolean
  }
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'writer'],
    default: 'writer'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: String
  },
  permissions: {
    canCreateArticles: {
      type: Boolean,
      default: true
    },
    canEditOwnArticles: {
      type: Boolean,
      default: true
    },
    canEditAllArticles: {
      type: Boolean,
      default: false
    },
    canDeleteArticles: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canPublishArticles: {
      type: Boolean,
      default: false
    },
    canManageSettings: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Set default permissions based on role
UserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = {
          canCreateArticles: true,
          canEditOwnArticles: true,
          canEditAllArticles: true,
          canDeleteArticles: true,
          canManageUsers: true,
          canPublishArticles: true,
          canManageSettings: true
        }
        break
      case 'editor':
        this.permissions = {
          canCreateArticles: true,
          canEditOwnArticles: true,
          canEditAllArticles: true,
          canDeleteArticles: true,
          canManageUsers: false,
          canPublishArticles: true,
          canManageSettings: false
        }
        break
      case 'writer':
        this.permissions = {
          canCreateArticles: true,
          canEditOwnArticles: true,
          canEditAllArticles: false,
          canDeleteArticles: false,
          canManageUsers: false,
          canPublishArticles: false,
          canManageSettings: false
        }
        break
    }
  }
  next()
})

// Index for better query performance
UserSchema.index({ username: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, isActive: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)