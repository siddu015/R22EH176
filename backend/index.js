require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

let users = {};
let posts = [];
let comments = {};

async function fetchData() {
    try {
        //Fetch call users
        const userResponse = await axios.get('http://20.244.56.144/test/users', {
            headers: {Authorization: `Bearer ${process.env.TOKEN}`}
        })
        users = userResponse.data.users;

        //Fetch posts for each user
        for (const userId in users) {
            const postResponse = await axios.get(`http://20.244.56.144/test/users/${userId}/posts`, {
                headers: { Authorization: `Bearer ${process.env.TOKEN}` }
            });
            posts = posts.concat(postResponse.data.posts);
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

// Calling it before server starts
fetchData().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});


// Top 5 users by post count
app.get('/users', (req, res) => {
    const postCounts = posts.reduce((acc, post) => {
        acc[post.userid] = (acc[post.userid] || 0) + 1;
        return acc;
    }, {});
    const topUsers = Object.entries(postCounts)
        .map(([userId, count]) => ({ userId, name: users[userId], postCount: count }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5);
    res.json(topUsers);
});


// Posts endpoint with type query
app.get('/posts', async (req, res) => {
    const type = req.query.type;
    if (type === 'popular') {

        // Fetch comments for all posts (only once)
        if (Object.keys(comments).length === 0) {
            for (const post of posts) {
                const commentResponse = await axios.get(`http://20.244.56.144/test/posts/${post.id}/comments`, {
                    headers: { Authorization: `Bearer ${process.env.TOKEN}` }
                });
                comments[post.id] = commentResponse.data.comments;
            }
        }

        // Find max comment count and return matching posts
        const postComments = posts.map(post => ({
            postId: post.id,
            userId: post.userid,
            content: post.content,
            commentCount: comments[post.id]?.length || 0
        }));
        const maxComments = Math.max(...postComments.map(p => p.commentCount));
        const popularPosts = postComments.filter(p => p.commentCount === maxComments);
        res.json(popularPosts);
    } else if (type === 'latest') {

        // Latest 5 posts (Assuming ID reflects in time)
        const latestPosts = posts
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)
            .map(post => ({ postId: post.id, userId: post.userid, content: post.content }));
        res.json(latestPosts);
    } else {
        res.status(400).json({ error: 'Invalid parameter type' });
    }
});
