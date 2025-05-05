import express from "express";
import { exec } from 'child_process';
import fs from "fs";
import path from "path";
import jq from "@jq-tools/jq";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

const filePath = path.join(__dirname, "users.json");
const duplicateUsers = path.join(__dirname, "duplicate-users.json");

app.get("/api/user", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read file:", err);
      return res.status(500).send("Error reading user data");
    }
    res.json(JSON.parse(data));
  });
});

app.get("/api/unique-user", (req, res) => {
  fs.readFile(duplicateUsers, "utf8", (err, data) => {
    if (err) {
      console.error("Failed to read file:", err);
      return res.status(500).send("Error reading user data");
    }
    res.json(JSON.parse(data));
  });
});

app.get("/api/male-user", (req, res) => {
  // Properly quote the file path in case of spaces or special characters
  const command = `jq '.[] | select(.gender == "Male" and .age < 18)' "${filePath}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Failed to run jq:", err);
      return res.status(500).send("Error running jq");
    }

    if (stderr) {
      console.error("stderr from jq:", stderr);
      return res.status(500).send("Error with jq execution");
    }

    try {
      // Handle jq output: if jq outputs multiple lines, join them into a single array
      const result = stdout
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      res.json(result); // Return the result as a JSON array
    } catch (parseError) {
      console.error("Failed to parse jq output:", parseError);
      res.status(500).send("Error parsing jq output");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
