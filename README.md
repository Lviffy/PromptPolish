# PromptPolish

A tool for enhancing and improving prompts using Gemini 2.0 Flash API.

## Features

- Chat with Gemini 2.0 Flash AI
- Enhance and polish your prompts
- Save and manage your conversations
- User authentication

## Setup

### Prerequisites

- Node.js 16+
- NPM or Yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Gemini API Key Setup

This application uses Google's Gemini 2.0 Flash API. You need to set up an API key:

1. Go to [Google AI Studio](https://ai.google.dev/) and create an account or sign in
2. Generate an API key
3. Create a `.env` file in the root directory of your project
4. Add your API key:

```
GEMINI_API_KEY=your_api_key_here
```

> **Note**: If you don't set up an API key, the application will run in mock mode, providing simulated responses.

### Starting the Application

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## Testing the Gemini API

You can test if your Gemini API key is working by navigating to:

```
http://localhost:5000/api/test-gemini
```

This will return a test response from the Gemini 2.0 Flash model, or an error if there's an issue with your API key.

## API Setup Help

For additional help with Gemini API setup, visit:

```
http://localhost:5000/api/gemini-setup
```

## Troubleshooting

- **API Key Issues**: Make sure your API key is valid and has access to the Gemini 2.0 Flash model
- **Regional Availability**: Ensure you're in a region where Gemini API is available
- **Rate Limiting**: If you hit rate limits, consider upgrading your API usage tier
- **Model Not Found**: Verify the model "gemini-2.0-flash" is available on your account

## API Documentation

The Gemini 2.0 Flash model is used throughout this application for:

- Chat conversations
- Prompt enhancement
- Content generation

For more information about the Gemini 2.0 Flash model capabilities, see the [official documentation](https://ai.google.dev/gemini-api/docs/models#gemini-2.0-flash). 