const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for the teaching assistant
const SYSTEM_PROMPT = `You are a helpful teaching assistant for Computer Science Engineering students. 

Your role:
- Explain concepts clearly with examples when needed
- Focus on topics like DSA (Data Structures & Algorithms), DBMS (Database Management Systems), OS (Operating Systems), CN (Computer Networks), Full Stack Web Development, Machine Learning and AI, Data Analysis, and programming in C++, Java, and Python
- Provide step-by-step explanations for complex topics
- Give practical examples and code snippets when appropriate
- Be encouraging and supportive to students
- If asked about topics outside CSE, politely redirect to CSE-related topics

Guidelines:
- Keep explanations clear and student-friendly
- Use analogies when explaining complex concepts
- Provide code examples in C++, Java, or Python when relevant
- Break down complex problems into smaller, manageable parts
- Always be patient and encouraging`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation history
    let conversationContext = SYSTEM_PROMPT + '\n\n';
    
    // Add previous messages to context
    chatHistory.forEach(msg => {
      conversationContext += `${msg.role}: ${msg.content}\n`;
    });
    
    // Add current message
    conversationContext += `User: ${message}\nAssistant: `;

    // Generate response
    const result = await model.generateContent(conversationContext);
    console.log('Gemini result:', result); 
    const response = await result.response;
    console.log('Gemini response:', response);
    const text = response.text();

    res.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

app.get('/', (req, res) => {
    res.send({
        activeStatus: true,
        error: false,
    })
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;