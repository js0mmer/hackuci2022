import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Result from './components/Result';
import "./css/style.css";
import './css/bootstrap-grid.min.css';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="upload" element={<Upload />} />
      <Route path="result" element={<Result />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.render(<AppRouter />, document.getElementById('root'));