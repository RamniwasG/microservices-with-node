const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    if(type === 'CommentCreated') {
        console.log('Received CommentCreated event for moderation:', data);
        await axios.post('http://localhost:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                content: data.content,
                postId: data.postId,
                status: data.content.includes('orange') ? 'rejected' : 'approved'
            }
        });
    }
    res.send({});
});

app.listen(4003, () => {
    console.log('Moderation service is running on port 4003');
});
