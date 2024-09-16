import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login

  // Fetch users on component mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  // Handle checkbox change
  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Select/Deselect all
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
      .post(
        'http://localhost:5000/api/users/block',
        { userIds: selectedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUserIds.includes(user.id) ? { ...user, status: 'blocked' } : user
          )
        );
      });
  };

  // Unblock selected users
  const unblockUsers = () => {
    axios
      .post(
        'http://localhost:5000/api/users/unblock',
        { userIds: selectedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setUsers((prev) =>
          prev.map((user) =>
            selectedUserIds.includes(user.id) ? { ...user, status: 'active' } : user
          )
        );
      });
  };

  const deleteUsers = () => {
    axios
      .post('http://localhost:5000/api/users/delete', // Changed to POST
        { userIds: selectedUserIds }, // Send selected user ids in request body
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        // Remove deleted users from the UI
        setUsers((prev) => prev.filter((user) => !selectedUserIds.includes(user.id)));
        setSelectedUserIds([]); // Clear selection after deletion
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  
  

  return (
    <table className="table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              onChange={(e) => handleSelectAll(e.target.checked)}
              checked={selectedUserIds.length === users.length}
            />
          </th>
          <th>Name</th>
          <th>Email</th>
          <th>Last Login Time</th>
          <th>Registration Time</th>
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
            <td>{new Date(user.last_login_time).toLocaleString()}</td>
            <td>{new Date(user.registration_time).toLocaleString()}</td>
            <td>{user.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  
};

export default AdminPanel;
