import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch users when component mounts
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUsers(response.data))
      .catch((error) => console.log(error));
  }, [token]);

  // Handle user selection
  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Select/Deselect all users
  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((user) => user.id));
    }
  };

  // Block selected users
  const blockUsers = () => {
    axios
      .post('http://localhost:5000/api/users/block', { userIds: selectedUserIds }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUserIds.includes(user.id) ? { ...user, status: 'blocked' } : user
          )
        );
        setSelectedUserIds([]);
      })
      .catch((error) => console.error('Error blocking users:', error));
  };

  // Unblock selected users
  const unblockUsers = () => {
    axios
      .post('http://localhost:5000/api/users/unblock', { userIds: selectedUserIds }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUserIds.includes(user.id) ? { ...user, status: 'active' } : user
          )
        );
        setSelectedUserIds([]);
      })
      .catch((error) => console.error('Error unblocking users:', error));
  };

  // Delete selected users
  const deleteUsers = () => {
    axios
      .post('http://localhost:5000/api/users/delete', { userIds: selectedUserIds }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        // Remove deleted users from the UI
        setUsers((prev) => prev.filter((user) => !selectedUserIds.includes(user.id)));
        setSelectedUserIds([]);
      })
      .catch((error) => console.error('Error deleting users:', error));
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <div>
        <button onClick={blockUsers} disabled={!selectedUserIds.length}>Block</button>
        <button onClick={unblockUsers} disabled={!selectedUserIds.length}>Unblock</button>
        <button onClick={deleteUsers} disabled={!selectedUserIds.length}>Delete</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedUserIds.length === users.length}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
