import React from 'react';
import './App.css';
import Stake from './pages/Stake';
import { Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';

function App() {
  return (
    <React.Fragment>
      <Routes>
        <Route path='/' element={<Stake/>} />
        <Route path='/admin' element={<Admin/>} />
      </Routes>
    </React.Fragment>
  );
}

export default App;
