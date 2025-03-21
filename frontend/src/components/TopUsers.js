import { useState, useEffect } from 'react';
import axios from 'axios';

function TopUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/users')
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    return (
        <div>
            <h1 className="mb-4 text-center">Top Users</h1>
            <div className="row g-4">
                {users.map(user => (
                    <div key={user.userId} className="col-12 col-sm-6 col-md-4">
                        <div className="card h-100 border-0 shadow-sm">
                            <img
                                src={`https://picsum.photos/200?random=${user.userId}`}
                                className="card-img-top rounded-top"
                                alt={user.name}
                                style={{ height: '150px', objectFit: 'cover' }}
                            />
                            <div className="card-body text-center">
                                <h5 className="card-title text-primary">{user.name}</h5>
                                <p className="card-text text-muted">Posts: {user.postCount}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopUsers;
