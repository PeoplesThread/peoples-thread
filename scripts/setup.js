const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leftist-news'

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'writer'], default: 'admin' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

const User = mongoose.model('User', UserSchema)

// Sample article schema
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true, enum: ['politics', 'social-justice', 'labor'] },
  tags: [String],
  author: { type: String, required: true },
  published: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  aiGenerated: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
}, { timestamps: true })

const Article = mongoose.model('Article', ArticleSchema)

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB successfully!')

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@progressivevoice.com' })
    if (!adminExists) {
      const admin = new User({
        email: 'admin@progressivevoice.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      })
      await admin.save()
      console.log('Admin user created: admin@progressivevoice.com / admin123')
    } else {
      console.log('Admin user already exists')
    }

    // Create sample articles
    const articleCount = await Article.countDocuments()
    if (articleCount === 0) {
      const sampleArticles = [
        {
          title: 'Corporate Tax Avoidance: How Big Business Dodges Billions While Workers Struggle',
          slug: 'corporate-tax-avoidance-big-business-dodges-billions',
          content: `<div class="article-content">
            <p>While working families face rising costs and stagnant wages, America's largest corporations continue to exploit loopholes and offshore schemes to avoid paying their fair share of taxes. A new analysis reveals that Fortune 500 companies collectively avoided over $40 billion in federal taxes last year alone.</p>
            
            <h2>The Scale of Corporate Tax Avoidance</h2>
            <p>The numbers are staggering. Companies like Amazon, which reported $11.2 billion in profits, paid an effective tax rate of just 6% - far below the statutory corporate rate of 21%. Meanwhile, working families earning $50,000 annually face effective tax rates of 15% or higher when including payroll taxes.</p>
            
            <blockquote>"This is a rigged system that prioritizes corporate profits over public investment in education, healthcare, and infrastructure," said Sarah Martinez, a tax policy analyst at the Progressive Policy Institute.</blockquote>
            
            <h2>Impact on Public Services</h2>
            <p>This massive tax avoidance directly impacts funding for essential public services. Schools face budget cuts, infrastructure crumbles, and social programs are slashed - all while corporations hoard record profits in offshore accounts.</p>
            
            <h2>What Can Be Done</h2>
            <p>Progressive lawmakers are pushing for comprehensive tax reform that would close these loopholes and ensure corporations pay their fair share. Key proposals include:</p>
            <ul>
              <li>Implementing a minimum corporate tax rate of 15%</li>
              <li>Closing offshore tax haven loopholes</li>
              <li>Increasing transparency in corporate tax reporting</li>
              <li>Strengthening IRS enforcement capabilities</li>
            </ul>
            
            <p>The fight for tax justice is ultimately about creating an economy that works for everyone, not just the wealthy elite. It's time to demand that corporations contribute their fair share to the society that enables their success.</p>
          </div>`,
          excerpt: 'Fortune 500 companies avoided over $40 billion in federal taxes while working families struggle with rising costs and stagnant wages.',
          category: 'politics',
          tags: ['corporate taxes', 'tax avoidance', 'economic inequality', 'progressive policy'],
          author: 'Progressive Voice Editorial Team',
          featured: true,
          views: 1247
        },
        {
          title: 'Amazon Workers Win Historic Union Vote Despite Corporate Intimidation Campaign',
          slug: 'amazon-workers-historic-union-vote-corporate-intimidation',
          content: `<div class="article-content">
            <p>In a groundbreaking victory for labor rights, Amazon warehouse workers in Staten Island have successfully voted to form the company's first union in the United States, overcoming a massive corporate campaign designed to suppress organizing efforts.</p>
            
            <h2>David vs. Goliath Victory</h2>
            <p>The Amazon Labor Union (ALU) secured victory with 2,654 votes in favor and 2,131 against, representing over 8,000 workers at the JFK8 fulfillment center. This historic win comes after years of failed organizing attempts and represents a major breakthrough for the labor movement.</p>
            
            <blockquote>"This victory belongs to every worker who stood up against intimidation and chose solidarity over fear," said Christian Smalls, president of the Amazon Labor Union.</blockquote>
            
            <h2>Corporate Union-Busting Tactics</h2>
            <p>Amazon spent millions on anti-union consultants and subjected workers to mandatory meetings designed to discourage organizing. The company also increased surveillance, threatened job losses, and even changed traffic light patterns to disrupt union activities.</p>
            
            <h2>Broader Implications</h2>
            <p>This victory sends shockwaves through corporate America and provides inspiration for workers nationwide who are fighting for better conditions, fair wages, and workplace democracy. It demonstrates that even the most powerful corporations can be challenged when workers unite.</p>
            
            <h2>The Fight Continues</h2>
            <p>While this represents a major victory, the struggle is far from over. Amazon will likely challenge the results, and workers must now negotiate their first contract. The success of this effort will depend on continued solidarity and support from the broader labor movement.</p>
            
            <p>This historic win proves that when workers organize and fight back, they can achieve the impossible. It's a reminder that the power to change our economy lies in our collective action.</p>
          </div>`,
          excerpt: 'Amazon warehouse workers in Staten Island vote to form the company\'s first U.S. union, overcoming massive corporate intimidation campaign.',
          category: 'labor',
          tags: ['Amazon', 'union organizing', 'workers rights', 'labor victory'],
          author: 'Progressive Voice Editorial Team',
          featured: true,
          views: 2156
        },
        {
          title: 'Police Reform Activists Demand Community Control After Latest Shooting',
          slug: 'police-reform-activists-community-control-latest-shooting',
          content: `<div class="article-content">
            <p>Following another fatal police shooting of an unarmed Black man, community activists are renewing calls for fundamental police reform and community control over law enforcement, arguing that incremental changes have failed to address systemic violence.</p>
            
            <h2>Pattern of Violence</h2>
            <p>The shooting of Marcus Johnson, 23, marks the fourth police killing in the city this year, continuing a pattern of disproportionate violence against Black and Brown communities. Despite previous promises of reform, little has changed in police practices or accountability.</p>
            
            <blockquote>"We've tried body cameras, sensitivity training, and community policing. None of it works because the system itself is the problem," said Dr. Angela Davis, a longtime police abolition advocate.</blockquote>
            
            <h2>Community-Led Solutions</h2>
            <p>Activists are pushing for community control models that would:</p>
            <ul>
              <li>Transfer police oversight to elected community boards</li>
              <li>Redirect police funding to education, mental health, and social services</li>
              <li>Implement restorative justice programs</li>
              <li>Create community-based safety programs</li>
            </ul>
            
            <h2>Systemic Change Needed</h2>
            <p>The movement for police accountability recognizes that individual prosecutions, while important, cannot address the systemic nature of police violence. Real change requires dismantling the structures that enable and protect police violence while building community-controlled alternatives.</p>
            
            <h2>Building Power</h2>
            <p>Community organizations are building political power to implement these changes, running candidates for local office and organizing ballot initiatives. They understand that lasting change requires both grassroots organizing and electoral strategy.</p>
            
            <p>The fight for police accountability is ultimately about creating communities where everyone can live with dignity and safety. It requires us to imagine and build alternatives to a system rooted in violence and control.</p>
          </div>`,
          excerpt: 'Community activists demand fundamental police reform and community control following another fatal police shooting of an unarmed Black man.',
          category: 'social-justice',
          tags: ['police reform', 'community control', 'racial justice', 'police accountability'],
          author: 'Progressive Voice Editorial Team',
          featured: false,
          views: 892
        }
      ]

      for (const articleData of sampleArticles) {
        const article = new Article(articleData)
        await article.save()
      }
      
      console.log('Sample articles created successfully!')
    } else {
      console.log('Articles already exist in database')
    }

    console.log('Database setup completed successfully!')
    
  } catch (error) {
    console.error('Error setting up database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

setupDatabase()