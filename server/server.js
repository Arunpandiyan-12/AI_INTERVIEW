const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { Pool } = require('pg');

const app = express();
const port = 5000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '***git',
  port: 5432,
});           

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.post('/extract', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file provided.' });
  }

  try {
    const pdfBuffer = req.file.buffer;
    const data = await pdf(pdfBuffer);
    const extractedText = data.text;
    const extractedWords = extractedText.split(/\s+/);
    await pool.query('DELETE FROM extracted_words');
    const wordsJSON = JSON.stringify(extractedWords);
    const query = 'INSERT INTO extracted_words (words_json) VALUES ($1)';
    await pool.query(query, [wordsJSON]);

    res.json({ success: true, message: 'Words extracted and stored successfully.' });
  } catch (error) {
    console.error('Error extracting or storing PDF:', error);
    res.status(500).json({ error: 'Error extracting or storing PDF.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
