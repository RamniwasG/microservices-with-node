const express = require('express');
const { randomBytes } = require('crypto');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const commentsByPostId = {}

// app.get('/posts/all-comments', (req, res) => {
//     res.send(commentsByPostId || "Not found!");
// });

// app.get('/posts/:id/comments', (req, res) => {
//     const { id } = req.params;
//     res.send(commentsByPostId[id] || "Not found!");
// });

app.post('/posts/:id/comments/add-new', async (req, res) => {
    const { id } = req.params;
    const commentId = randomBytes(8).toString('hex');
    const { content } = req.body;
    const comment = {
        id: commentId,
        content,
        status: 'pending'
    };
    if (!commentsByPostId[id]) {
        commentsByPostId[id] = [];
    }
    commentsByPostId[id].push(comment);

    // Emit an event to the event bus
    try {
        await axios.post('http://localhost:4005/events', {
            type: 'CommentCreated',
            data: {
                id: commentId,
                content,
                postId: id,
                status: 'pending'
            }
        }); 
    } catch (error) {
        console.error('Error occurred while forwarding event:', error);
    }
    res.send({})
});

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    console.log('Received event:', type, data);
    if(type === 'CommentModerated') {
        const { postId, id, status, content } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => comment.id === id);
        if(comment) {
            comment.status = status;
        }
        try {
            await axios.post('http://localhost:4005/events', {
                type: 'CommentUpdated',
                data: {
                    id,
                    content,
                    postId,
                    status
                }
            });
        } catch (error) {
            console.error('Error occurred while forwarding event:', error);
        }
    }
    res.send({});
});

app.listen(4001, () => {
    console.log('Comments service is running on port 4001');
});
