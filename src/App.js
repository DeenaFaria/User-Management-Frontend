import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/UserManagement';
import PrivateRoute from './components/PrivateRoute'; // Protects admin panel route

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<PrivateRoute component={AdminPanel} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
