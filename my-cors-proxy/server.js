const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('CORS Proxy Server is running');
});

app.get('/proxy', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching the URL');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`CORS Proxy Server is running on port ${PORT}`);
});
