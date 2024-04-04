const  OpenAIApi = require('openai');

const openai = new OpenAIApi({
  api_key: process.env.GROQ_API_KEY,
  
});

module.exports = openai;
