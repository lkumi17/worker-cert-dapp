import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import WorkerRegistrationApp from './components/WorkerRegistrationApp';
import CertificationCheckApp from './components/CertificationCheckApp';
import ConnectWallet from './components/ConnectWallet';

const App = () => {
    return (
        <Router>
            <div>
                <ConnectWallet /> {/* Add the wallet connection component here */}
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
