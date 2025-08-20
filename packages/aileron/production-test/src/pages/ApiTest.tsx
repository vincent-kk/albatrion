import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

const ApiTest = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page">
      <h1>API Test Page</h1>
      <p>Test API calls, data fetching, and state management.</p>

      <section>
        <h2>User List (JSONPlaceholder API)</h2>
        
        <button onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Users'}
        </button>

        {error && (
          <div style={{ 
            color: 'red', 
            padding: '1rem', 
            margin: '1rem 0',
            backgroundColor: '#fee',
            borderRadius: '4px'
          }}>
            Error: {error}
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Username</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{user.name}</td>
                    <td style={{ padding: '0.5rem' }}>{user.username}</td>
                    <td style={{ padding: '0.5rem' }}>{user.email}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedUser(user)}
                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedUser && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <h3>User Details</h3>
            <button 
              onClick={() => setSelectedUser(null)}
              style={{ float: 'right', fontSize: '0.875rem' }}
            >
              Close
            </button>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Website:</strong> {selectedUser.website}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ApiTest;