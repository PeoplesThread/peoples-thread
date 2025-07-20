# Peoples Thread - Progressive News Website

A modern news website built with Next.js that delivers progressive news and analysis, featuring comprehensive content management and Google AdSense integration.

## Features

### 🏛️ Content Categories
- **Politics & Government** - Progressive political analysis challenging corporate power
- **Social Justice & Civil Rights** - Fighting systemic oppression and inequality
- **Labor & Workers' Rights** - Supporting workers' rights and union organizing

### ⚡ Content Automation
- **Scheduled Publishing** - Schedule articles for automatic publication
- **Content Planning** - Plan and organize content calendar
- **Progressive Focus** - Curated content from a progressive perspective
- **Editorial Review** - All content reviewed before publication

### 📝 Content Management
- **Rich Text Editor** - Full-featured article creation with ReactQuill
- **Draft System** - Save articles as drafts before publishing
- **Featured Articles** - Highlight important content on homepage
- **Category Management** - Organize content by political focus areas
- **SEO Optimization** - Automatic slug generation and meta tags

### 💰 Monetization
- **Google AdSense Integration** - Responsive ad placement throughout site
- **Newsletter System** - Build subscriber base for direct engagement
- **Analytics Dashboard** - Track performance and engagement metrics

### 📊 Admin Features
- **Article Management** - Create, edit, publish, and delete articles
- **Content Scheduling** - Schedule articles for future publication
- **Analytics Dashboard** - View site performance and content metrics
- **Newsletter Management** - Track and manage subscribers

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Content Tools**: Advanced content management system
- **Content Editor**: ReactQuill
- **Scheduling**: Node-cron
- **Authentication**: JWT (ready for expansion)
- **Deployment**: Vercel-ready

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd progressive-voice-news
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local` and configure:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/peoples-thread

   # JWT Secret
   JWT_SECRET=your_jwt_secret_here

   # Google AdSense
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=your_adsense_client_id_here

   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local`

5. **Configure OpenAI API**
   - Get an API key from OpenAI
   - Add it to your `.env.local` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Initialize the content scheduler**
   ```bash
   curl -X POST http://localhost:3000/api/init-scheduler
   ```

## Usage

### Creating Manual Content

1. Navigate to `/admin`
2. Click "Create New Article"
3. Fill in the article details
4. Use the rich text editor for content
5. Save as draft or publish immediately

### AI Content Generation

1. Go to `/admin` and select "AI Generator"
2. Enter a topic (e.g., "Corporate tax avoidance schemes")
3. Select a category (Politics, Social Justice, or Labor)
4. Optionally add custom prompts for specific focus
5. Generate and review the content
6. Edit if needed and publish

### Scheduled Content

1. Navigate to "Scheduled Posts" in admin
2. Create a new scheduled post with:
   - Topic for AI to write about
   - Category and timing
   - Optional custom prompts
   - Recurring schedule (daily/weekly/monthly)
3. The system will automatically generate and publish content

### AdSense Setup

1. Get approved for Google AdSense
2. Add your AdSense client ID to `.env.local`
3. Ads will automatically appear in designated slots:
   - Homepage top, middle, and bottom
   - Article pages (top, middle, bottom)
   - Category pages

## Content Strategy

### Progressive Perspective
All content is generated and curated from a leftist perspective, focusing on:
- **Anti-corporate messaging** - Challenging corporate power and influence
- **Worker solidarity** - Supporting labor rights and union organizing
- **Social justice** - Centering marginalized voices and experiences
- **Systemic analysis** - Addressing root causes, not just symptoms
- **Community organizing** - Highlighting grassroots movements and activism

### AI Prompts
The system uses carefully crafted prompts to ensure AI-generated content maintains:
- Progressive political analysis
- Evidence-based reporting
- Inclusive language and perspectives
- Calls to action for readers
- Focus on systemic change rather than individual solutions

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Database Setup
- Use MongoDB Atlas for production
- Update `MONGODB_URI` with your Atlas connection string

### Domain and AdSense
1. Configure your custom domain
2. Update AdSense settings with your domain
3. Ensure all environment variables are set in production

## Contributing

This project is designed to support progressive media and leftist organizing. Contributions should align with these values:

1. **Content Quality** - Maintain high journalistic standards
2. **Progressive Values** - All content should support social justice and workers' rights
3. **Accessibility** - Ensure the site is accessible to all users
4. **Security** - Protect user data and maintain site security

## License

This project is open source and available under the MIT License.

## Support

For support with setup or customization, please refer to the documentation or create an issue in the repository.

---

**Fighting for justice, equality, and workers' rights through progressive media.**