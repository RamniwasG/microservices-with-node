
const express = require('express');
const { randomBytes } = require('crypto');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const posts = {}

const handleEvent = (type, data) => {
    const id = randomBytes(8).toString('hex');
    if(type === 'PostCreated') {
        console.log('Received PostCreated event:', data);
        posts[id] = {
            id,
            title: data.title,
            comments: []
        }
    } else if(type === 'CommentCreated') {
        console.log('Received CommentCreated event:', data);
        const post = posts[data.postId];
        if(post) {
            post.comments.push({
                id: data.id,
                content: data.content,
                status: data.status
            });
        }
    } else if(type === 'CommentUpdated') {
        console.log('Received CommentUpdated event:', data);
        const post = posts[data.postId];
        if(post) {
            const comment = post.comments.find(comment => comment.id === data.id);
            if(comment) {
                comment.status = data.status;
                comment.content = data.content;
            }
        }
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.send({});
});

app.listen(4002, async () => {
    console.log('Query service is running on port 4002');
    
    // Fetch all events from the event bus to reconstruct the state
    const resp = await axios.get('http://localhost:4005/events');
    for(let event of resp.data) {
        console.log('Processing event:', event.type);
        handleEvent(event.type, event.data);
    }
});
