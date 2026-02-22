export interface CyberChallenge {
  type: "scenario" | "email" | "link";
  title: string;
  description: string;
  data: any;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const generateCyberQuestion = async (difficulty: string): Promise<CyberChallenge> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const challengeTypes = ["scenario", "email", "link"];
  const selectedType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

  const topics = [
    "UPI payment link scam",
    "Fake bank KYC update call",
    "Digital Arrest (fake police/CBI call)",
    "Work from home / Part-time job fraud",
    "Fake electricity bill payment SMS",
    "SIM swap fraud",
    "OLX/Marketplace QR code scam",
    "Fake courier/parcel delivery issue",
    "Social media account hijacking",
    "Investment/Stock market tips scam"
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Cyber Awareness App"
    },
    body: JSON.stringify({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `You are a cybersecurity expert. Generate a unique, highly realistic cybersecurity challenge for a user in India.
          
          Challenge Types:
          1. 'scenario': A text-based story where the user must decide what to do.
          2. 'email': A phishing email simulation. 'data' should be an object with { from, subject, body }.
          3. 'link': A malicious link identification task. 'data' should be a string (the URL).
          
          Avoid generic templates. Use specific details like app names, common Indian names, or realistic dialogue.`
        },
        {
          role: "user",
          content: `Generate a '${selectedType}' challenge focusing on: ${randomTopic}. 
          Difficulty: ${difficulty}.
          The response must be a JSON object with these keys: 
          - type (string: 'scenario', 'email', or 'link')
          - title (string: short title)
          - description (string: instructions for the user)
          - data (any: the content based on type)
          - options (array of 4 strings)
          - correctAnswer (string, must match one of the options exactly)
          - explanation (string)
          - difficulty (string: Easy, Medium, or Hard).
          
          Ensure the challenge is different from common textbook examples.`
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
};

export const getChatbotResponse = async (userQuery: string): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return "I'm sorry, the AI assistant is not configured. Please set the OPENROUTER_API_KEY.";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-Title": "Cyber Awareness App"
    },
    body: JSON.stringify({
      model: "stepfun/step-3.5-flash:free",
      messages: [
        {
          role: "system",
          content: `You are a helpful cybersecurity awareness assistant. 
          Respond in simple, non-technical language. 
          Provide prevention advice. 
          Suggest reporting to 1930 if applicable. 
          Encourage playing the cyber challenge. 
          Keep responses under 150 words. 
          Never provide instructions on committing fraud. 
          Always encourage reporting scams.
          IMPORTANT: Do not use any markdown formatting like bold (**) or italics (*). Return plain text only.`
        },
        {
          role: "user",
          content: userQuery
        }
      ]
    })
  });

  if (!response.ok) {
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }

  const data = await response.json();
  return data.choices[0].message.content || "I'm sorry, I couldn't process that request.";
};
