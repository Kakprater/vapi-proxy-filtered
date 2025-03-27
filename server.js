
// server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.error('Error: VAPI_API_KEY is not defined in the environment variables.');
  process.exit(1);
}

app.use(cors());

app.get('/api/calls', async (req, res) => {
  try {
    const { id } = req.query;

    const vapiRes = await fetch('https://api.vapi.ai/call', {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!vapiRes.ok) {
      return res.status(vapiRes.status).json({ error: await vapiRes.text() });
    }

    const data = await vapiRes.json();

    // Normalize calls data to array
    let calls = Array.isArray(data) ? data : Object.values(data).find(v => Array.isArray(v)) || [];

    // If callId is provided, filter by it
    if (id) {
      const match = calls.find(call => (call.id || call.call_id) === id);
      if (!match) {
        return res.status(404).json({ error: 'Call ID not found' });
      }
      return res.json(match);
    }

    // Return full call list if no ID was specified
    res.json(calls);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ VAPI Proxy Server running on http://localhost:${PORT}`);
});
