# Gemini AI Integration Setup

## Overview
The Network Graph tab now includes an AI Assistant powered by Google's Gemini AI that can answer questions about your social network data.

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables
1. Open `backend/.env` file
2. Replace `your-gemini-api-key-here` with your actual Gemini API key:
   ```
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### 3. Restart the Backend Server
After updating the environment variables, restart your backend server:
```bash
cd backend
npm start
```

## Features

### AI Assistant Interface
- **Input Box**: Located in the Network Graph tab sidebar
- **Send Button**: Submit your question to Gemini AI
- **Response Display**: Shows AI-generated insights about your network

### Supported Query Types
The AI can analyze and answer questions about:

1. **Network Structure**
   - "What's the overall network structure?"
   - "How connected is the network?"
   - "What are the main clusters?"

2. **User Analysis**
   - "Who are the most connected users?"
   - "Find users with similar interests"
   - "Who are the influencers in the network?"

3. **Geographic Analysis**
   - "Where are most users located?"
   - "Show geographic distribution"

4. **Activity Patterns**
   - "What's the recent activity like?"
   - "Who's most active?"

5. **Specific User Queries**
   - "Tell me about user John Doe"
   - "What connections does Akash have?"

## Data Sources
The AI has access to:
- User profiles (names, usernames, bios, locations)
- Friendship connections
- Recent posts and activity
- Network statistics
- Geographic distribution

## Example Queries
Try asking:
- "Who are the top 5 most connected users?"
- "What's the network structure like?"
- "Find users from New York"
- "Who has the most friends?"
- "What are the main activity patterns?"

## Troubleshooting

### "Gemini AI is not configured" Error
- Make sure you've set the `GEMINI_API_KEY` in your `.env` file
- Restart the backend server after updating environment variables
- Verify the API key is correct and active

### "Failed to process AI query" Error
- Check your internet connection
- Verify the Gemini API key is valid
- Check backend server logs for detailed error messages

## Security Notes
- The AI only has access to your network data, not external information
- All queries are processed server-side
- No user data is sent to external services except Google's Gemini API
- API keys should be kept secure and not shared publicly
