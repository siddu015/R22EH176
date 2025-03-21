import { useState, useEffect } from 'react';
import axios from 'axios';

function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = () => {
            axios.get('http://localhost:8080/posts?type=latest')
                .then(response => setPosts(response.data))
                .catch(error => console.error('Error fetching feed:', error));
        };
        fetchPosts();
        const interval = setInterval(fetchPosts, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1 className="mb-4 text-center">Live Feed</h1>
            <div className="row g-4 justify-content-center">
                {posts.map(post => (
                    <div key={post.postId} className="col-12 col-md-8">
                        <div className="card border-0 shadow-sm">
                            <div className="row g-0">
                                <div className="col-md-4">
                                    <img
                                        src={`https://picsum.photos/200?random=${post.postId}`}
                                        className="img-fluid rounded-start"
                                        alt="Post"
                                        style={{ height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-8">
                                    <div className="card-body">
                                        <p className="card-text">{post.content}</p>
                                        <small className="text-muted">Post ID: {post.postId}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Feed;
