const express = require('express');
const { randomBytes } = require('crypto');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const posts = {}

app.post('/add-post', async (req, res) => {
    const id = randomBytes(8).toString('hex');
    const { title } = req.body;
    posts[id] = {
        id,
        title
    }
    try {
        await axios.post('http://localhost:4005/events', {
            type: 'PostCreated',
            data: {
                id,
                title
            }
        });
    } catch (error) {
        console.error('Error occurred while forwarding event:', error);
    }
    res.send(posts[id]);
});

app.listen(4000, () => {
    console.log('Posts service is running on port 4000');
});
