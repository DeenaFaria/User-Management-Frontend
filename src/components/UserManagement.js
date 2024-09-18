import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import { useNavigate } from 'react-router-dom'; // For navigation

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate(); // Initialize navigate

  // Decode the token to get currentUser details
  const currentUser = token ? jwtDecode(token) : null;

  // Axios request interceptor to handle 403 errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          // If the server responds with 403, force logout
          alert('You have been blocked or your session is invalid. Redirecting to login...');
          localStorage.removeItem('token');
          navigate('/login'); // Redirect to login page
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Eject the interceptor when the component unmounts to prevent memory leaks
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Fetch users when component mounts
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUsers(response.data))
      .catch((error) => console.log(error));
  }, [token]);

  // WebSocket logic for detecting if the current user is blocked
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'block' && currentUser && data.userId === currentUser.id) {
        // Log out the blocked user and redirect to login
        alert('You have been blocked. Redirecting to login...');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser, navigate]);

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
      <div className="toolbar">
        <button className="btn btn-danger" onClick={blockUsers}>Block</button>
        <button className="btn btn-light" onClick={unblockUsers}>
          <i className="fa fa-unlock"></i> Unblock
        </button>
        <button className="btn btn-light" onClick={deleteUsers}>
          <i className="fa fa-trash"></i> Delete
        </button>
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
            <th>Registration Time</th>
            <th>Last Login Time</th>
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
              <td>{user.registration_time}</td>
              <td>{user.last_login_time}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
