
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketing from './pages/Marketing';
import Telesales from './pages/Telesales';
import Managerwebsitetab from './pages/Managerwebsitetab';
import Manageramazontab from './pages/Manageramazontab';
import List from './pages/List';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute element={Dashboard} />} />
        <Route path="/marketing" element={<PrivateRoute element={Marketing} />} />
        <Route path="/telesales" element={<PrivateRoute element={Telesales} />} />
        <Route path="/managerwebsitetab" element={<PrivateRoute element={Managerwebsitetab} />} />
        <Route path="/manageramazontab" element={<PrivateRoute element={Manageramazontab} />} />
        <Route path="/list" element={<PrivateRoute element={List} />} />
  </Routes>
    </div>
  );
}

export default App;
