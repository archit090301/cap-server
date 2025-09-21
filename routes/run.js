// routes/run.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// POST /api/run
router.post("/", async (req, res) => {
  const { code, language, stdin } = req.body;

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

const languageId = languageMap[language];

if (!code || !languageId) {
  return res.status(400).json({ error: "Code and language are required" });
}


  try {
    // Send submission to Judge0 API
    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin || "",
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    const result = submission.data;

    // Build combined output
    let output = "";
    if (result.compile_output) output += `❌ Compilation error:\n${result.compile_output}\n`;
    if (result.stderr) output += `⚠️ Runtime error:\n${result.stderr}\n`;
    if (result.stdout) output += `✅ Output:\n${result.stdout}`;
    if (!output) output = "No output";

    // Return structured + combined
    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      message: result.message,
      output, // 👈 combined
    });

  } catch (err) {
    console.error("Judge0 error:", err.response?.data || err.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

module.exports = router;
