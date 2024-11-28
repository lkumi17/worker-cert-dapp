import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import WorkerRegistrationApp from './components/WorkerRegistrationApp';
import CertificationCheckApp from './components/CertificationCheckApp';
import ConnectWallet from './components/ConnectWallet';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <ConnectWallet /> {/* Wallet connection component */}
                <Routes>
                    <Route path="/register" element={<WorkerRegistrationApp />} />
                    <Route path="/check" element={<CertificationCheckApp />} />
                    <Route path="/" element={<WorkerRegistrationApp />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
