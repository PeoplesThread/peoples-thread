# PBS NewsHour Monitor

This feature automatically monitors PBS NewsHour articles and generates leftist perspective response articles using AI.

## How It Works

1. **Article Monitoring**: The system fetches the latest articles from PBS NewsHour's RSS feed
2. **Keyword Filtering**: Articles are filtered for progressive keywords (labor, unions, healthcare, etc.)
3. **AI Generation**: For each relevant PBS article, AI generates a leftist perspective response
4. **Auto-Publishing**: Generated articles are automatically published with proper categorization

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# OpenAI API Key (required for AI article generation)
OPENAI_API_KEY=your_openai_api_key_here

# PBS Monitor API Keys
PBS_MONITOR_API_KEY=your_secret_pbs_monitor_key_here
CRON_SECRET=your_cron_secret_key_here
NEXT_PUBLIC_PBS_MONITOR_API_KEY=your_secret_pbs_monitor_key_here
```

### 2. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your environment variables
4. Make sure you have credits in your OpenAI account

### 3. Generate Secret Keys

Generate random secret keys for the PBS monitor:

```bash
# Generate random keys (use any method you prefer)
openssl rand -base64 32  # For PBS_MONITOR_API_KEY
openssl rand -base64 32  # For CRON_SECRET
```

## Usage

### Manual Monitoring

1. Go to `/admin/pbs-monitor` in your admin dashboard
2. Click "Start Monitoring" to manually trigger the process
3. The system will check PBS NewsHour for new articles and generate responses

### Automatic Monitoring (Recommended)

Set up a cron job to automatically monitor PBS articles:

#### Option 1: Vercel Cron (if deployed on Vercel)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/pbs-monitor",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

#### Option 2: External Cron Service

Use services like:
- **cron-job.org** (free)
- **EasyCron**
- **Your server's crontab**

Set up a cron job to call:
```
GET https://yoursite.com/api/cron/pbs-monitor
Header: Authorization: Bearer YOUR_CRON_SECRET
```

Recommended frequency: Every 2-4 hours

#### Option 3: Server Crontab

If you have server access:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 4 hours)
0 */4 * * * curl -X GET "https://yoursite.com/api/cron/pbs-monitor" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitored Keywords

The system looks for these keywords in PBS articles:

**Labor & Economics:**
- labor, union, workers, strike, wages, employment
- corporate, capitalism, economy, recession, inflation
- tax, wealth, billionaire, minimum wage

**Social Issues:**
- healthcare, housing, inequality, poverty, welfare
- immigration, refugee, border, deportation
- police, criminal justice, prison, reform
- education, student debt, public school

**Politics & Rights:**
- voting rights, democracy, election, gerrymandering
- social security, medicare, medicaid

**Environment:**
- climate, environment, fossil fuel, renewable energy

## Generated Article Features

Each AI-generated article includes:

- **Leftist Perspective**: Critical analysis from a working-class viewpoint
- **Progressive Solutions**: Actionable policy recommendations
- **Source Attribution**: Links back to the original PBS article
- **Proper Categorization**: Automatically sorted into politics, social-justice, or labor
- **SEO Optimization**: Proper tags and metadata
- **AI Disclosure**: Clearly marked as AI-generated content

## Customization

### Modify Keywords

Edit the `MONITORED_KEYWORDS` array in `/lib/pbsMonitor.ts`:

```typescript
const MONITORED_KEYWORDS = [
  'your', 'custom', 'keywords', 'here'
]
```

### Adjust AI Prompt

Modify the prompt in the `generateLeftistResponse` function to change the tone or focus of generated articles.

### Change Monitoring Frequency

Adjust your cron job schedule:
- Every 2 hours: `0 */2 * * *`
- Every 6 hours: `0 */6 * * *`
- Daily at 9 AM: `0 9 * * *`

## Monitoring & Logs

- Check your application logs for monitoring activity
- Failed generations will be logged with error details
- The admin interface shows the last successful run time

## Rate Limiting

The system includes built-in rate limiting:
- 2-second delay between article generations
- Duplicate detection prevents re-processing the same PBS article
- OpenAI API rate limits are respected

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check your API key is valid
   - Ensure you have sufficient credits
   - Verify the API key has proper permissions

2. **RSS Feed Issues**
   - PBS may occasionally change their RSS format
   - Check the console logs for parsing errors

3. **Cron Job Not Running**
   - Verify your cron secret is correct
   - Check the cron service is properly configured
   - Test the endpoint manually first

### Testing

Test the system manually:

```bash
# Test the monitoring endpoint
curl -X POST "http://localhost:3000/api/monitor-pbs" \
  -H "Authorization: Bearer YOUR_PBS_MONITOR_API_KEY"

# Test the cron endpoint
curl -X GET "http://localhost:3000/api/cron/pbs-monitor" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Security Notes

- Keep your API keys secure and never commit them to version control
- Use strong, random secrets for authentication
- Consider IP whitelisting for cron endpoints in production
- Regularly rotate your API keys

## Cost Considerations

- Each generated article costs approximately $0.02-0.10 in OpenAI API credits
- Monitor your OpenAI usage dashboard
- Set up billing alerts to avoid unexpected charges
- Consider using GPT-3.5-turbo instead of GPT-4 for lower costs

## Support

If you encounter issues:
1. Check the application logs
2. Verify all environment variables are set
3. Test the OpenAI API key separately
4. Check the PBS RSS feed is accessible