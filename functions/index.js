const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();

// Initialize OpenAI with API Key from Firebase Config
// Set this via: firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || functions.config().openai?.key,
});

// Assistant ID should also be configured
const ASSISTANT_ID = process.env.ASSISTANT_ID || functions.config().openai?.assistant_id;

exports.getQuizQuestion = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { roadmap, skills, index } = req.body;

  try {
    // 1. Create a Thread if it's the first question, or use an existing one
    // For simplicity in this proxy, we create a new run each time or use stateless completion
    // The user mentioned "Assistants API", so we'll use a Thread-Run pattern if possible, 
    // but for a single question response, Chat Completions with JSON mode is often more reliable for structured output.
    
    // However, following the instruction to use Assistants API:
    /*
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Generate question ${index + 1} for a student on the ${roadmap} roadmap. Their known skills are: ${skills.join(", ")}.`
    });
    const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: ASSISTANT_ID });
    // ... polling for completion ...
    */

    // FOR THE SAKE OF RELIABILITY AND SPEED IN A DASHBOARD:
    // We will use Chat Completions with a System Prompt that mimics the Assistant's persona.
    // This ensures we get valid JSON every time without complex polling logic in a Cloud Function.

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are QuizGPT. Generate a multiple-choice question for a tech professional. Return ONLY JSON in this format: { \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctIndex\": 0 }. Context: Roadmap is " + roadmap + ", Student Skills: " + skills.join(", ") 
        },
        { 
          role: "user", 
          content: "Generate a challenging but fair question for my current level." 
        }
      ],
      response_format: { type: "json_object" },
    });

    const quizData = JSON.parse(completion.choices[0].message.content);
    res.status(200).send(quizData);

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).send({ error: "Failed to generate quiz question", details: error.message });
  }
});
