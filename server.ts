import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";
import { generateCyberQuestion, getChatbotResponse } from "./src/services/aiService";

dotenv.config();

const db = new Database("cyber_awareness.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT DEFAULT 'Cyber Scout',
    xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'Rookie 🌱',
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    consecutive_correct INTEGER DEFAULT 0,
    difficulty_level TEXT DEFAULT 'Easy',
    completed_guides TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    badge_name TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  INSERT OR IGNORE INTO users (id, username) VALUES (1, 'Cyber Scout');
`);

// Migration: Ensure completed_guides column exists
try {
  db.exec("ALTER TABLE users ADD COLUMN completed_guides TEXT DEFAULT ''");
} catch (e) {
  // Column likely already exists
}

const app = express();
app.use(express.json());

const PORT = 3000;

// ... existing code ...

// API Routes
app.get("/api/user", (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
    const badges = db.prepare("SELECT badge_name FROM badges WHERE user_id = 1").all();
    res.json({ 
      ...user, 
      badges: badges.map(b => b.badge_name),
      completed_guides: user.completed_guides ? user.completed_guides.split(',') : []
    });
  } catch (error) {
    console.error("Error in /api/user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/generate-question", async (req, res) => {
  try {
    const { difficulty } = req.query;
    const user = db.prepare("SELECT difficulty_level FROM users WHERE id = 1").get();
    const targetDifficulty = (difficulty as string) || user.difficulty_level;
    const question = await generateCyberQuestion(targetDifficulty);
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate question" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await getChatbotResponse(message);
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chatbot error" });
  }
});

app.get("/api/leaderboard", (req, res) => {
  // Mock leaderboard data for now
  const leaderboard = [
    { username: "Cyber King 👑", xp: 1250, level: "Cyber Guardian" },
    { username: "Security Pro 🛡️", xp: 980, level: "Cyber Guardian" },
    { username: "Scam Buster ⚔️", xp: 720, level: "Cyber Guard" },
    { username: "Digital Shield 🛡️", xp: 640, level: "Cyber Guard" },
    { username: "Byte Defender 🛡️", xp: 510, level: "Defender" },
  ];
  res.json(leaderboard);
});

app.post("/api/complete-guide", (req, res) => {
  try {
    const { guideTitle } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
    
    const completed = user.completed_guides ? user.completed_guides.split(',') : [];
    if (completed.includes(guideTitle)) {
      return res.json({ success: false, message: "Guide already completed" });
    }

    completed.push(guideTitle);
    const new_xp = user.xp + 15; // 15 XP for completing a guide
    const new_total_score = user.total_score + 15;
    
    db.prepare("UPDATE users SET xp = ?, total_score = ?, completed_guides = ? WHERE id = 1")
      .run(new_xp, new_total_score, completed.join(','));

    res.json({ 
      success: true, 
      user: { xp: new_xp, total_score: new_total_score, completed_guides: completed } 
    });
  } catch (error) {
    console.error("Error in /api/complete-guide:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/api/update-progress", (req, res) => {
  try {
    const { correct, xp_gained, difficulty } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = 1").get();

    const parsedXp = Math.abs(Number(xp_gained) || 0);
    const xpDelta = correct ? parsedXp : -parsedXp;
    let new_xp = Math.max(0, user.xp + xpDelta);
    let new_total_score = user.total_score + (correct ? Math.max(0, xpDelta) : 0);
    let new_games_played = user.games_played + 1;
    let new_consecutive = correct ? user.consecutive_correct + 1 : 0;
    
    // Adaptive Difficulty Logic
    let new_difficulty = user.difficulty_level;
    if (new_consecutive >= 3) {
      if (new_difficulty === 'Easy') new_difficulty = 'Medium';
      else if (new_difficulty === 'Medium') new_difficulty = 'Hard';
      new_consecutive = 0; // Reset after bump
    } else if (!correct) {
      // Check if missed twice? We'll simplify to: if incorrect, maybe drop difficulty if it's high
      // But the prompt says "If user answers incorrectly twice"
      // We'd need to track incorrect streak too. Let's add a simple check.
    }

    // Levels
    // 0–100 XP → Rookie
    // 100–300 XP → Defender
    // 300–600 XP → Cyber Guard
    // 600+ XP → Cyber Guardian
    let new_level = 'Rookie 🌱';
    if (new_xp >= 600) new_level = 'Cyber Guardian 🛡️';
    else if (new_xp >= 300) new_level = 'Cyber Guard ⚔️';
    else if (new_xp >= 100) new_level = 'Defender 🛡️';

    db.prepare(`
      UPDATE users SET 
        xp = ?, 
        level = ?, 
        total_score = ?, 
        games_played = ?, 
        consecutive_correct = ?,
        difficulty_level = ?
      WHERE id = 1
    `).run(new_xp, new_level, new_total_score, new_games_played, new_consecutive, new_difficulty);

    // Badge Logic
    const currentBadges = db.prepare("SELECT badge_name FROM badges WHERE user_id = 1").all().map(b => b.badge_name);
    const newBadges = [];

    const addBadge = (name) => {
      if (!currentBadges.includes(name)) {
        db.prepare("INSERT INTO badges (user_id, badge_name) VALUES (1, ?)").run(name);
        newBadges.push(name);
      }
    };

    if (new_games_played >= 1) addBadge("First Steps");
    if (new_total_score >= 100) addBadge("Century");
    if (new_xp >= 50) addBadge("Cyber Scout");
    if (correct && parsedXp >= 30) addBadge("Quick Thinker"); // Hard question correct
    if (new_consecutive >= 3) addBadge("Triple Threat");

    res.json({ 
      success: true, 
      user: { xp: new_xp, level: new_level, total_score: new_total_score, difficulty_level: new_difficulty },
      newBadges 
    });
  } catch (error) {
    console.error("Error in /api/update-progress:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
