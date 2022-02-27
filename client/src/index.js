import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import './css/bootstrap.min.css';
import './css/main.css';
import './css/all.min.css';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="upload" element={<Upload />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.render(<AppRouter />, document.getElementById('root'));