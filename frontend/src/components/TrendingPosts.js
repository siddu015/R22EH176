import { useState, useEffect } from 'react';
import axios from 'axios';

function TrendingPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/posts?type=popular')
            .then(response => setPosts(response.data))
            .catch(error => console.error('Error fetching trending posts:', error));
    }, []);

    return (
        <div>
            <h1 className="mb-4 text-center">Trending Posts</h1>
            <div className="row g-4">
                {posts.map(post => (
                    <div key={post.postId} className="col-12 col-sm-6 col-md-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src={`https://picsum.photos/200?random=${post.postId}`}
                                className="card-img-top rounded-top"
                                alt="Post"
                                style={{ height: '150px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <p className="card-text">{post.content}</p>
                                <p className="card-text">
                                    <span className="badge bg-success">Comments: {post.commentCount}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TrendingPosts;
