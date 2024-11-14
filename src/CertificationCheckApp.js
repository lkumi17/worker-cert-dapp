import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WorkerCertificationContract from '../contracts/WorkerCertification.json';

const CertificationCheckApp = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [workerIdCheck, setWorkerIdCheck] = useState('');
    const [taskIdCheck, setTaskIdCheck] = useState('');
    const [isCertified, setIsCertified] = useState(null);
    
    const [workerIdQuery, setWorkerIdQuery] = useState('');
    const [queriedWorker, setQueriedWorker] = useState(null);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    const loadBlockchainData = async () => {
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = WorkerCertificationContract.networks[networkId];
        const contractInstance = new web3.eth.Contract(
            WorkerCertificationContract.abi,
            deployedNetwork && deployedNetwork.address
        );
        setContract(contractInstance);
    };

    const checkCertification = async () => {
        try {
            const result = await contract.methods.checkCertification(workerIdCheck, taskIdCheck).call({ from: account });
            setIsCertified(result);
        } catch (error) {
            console.error("Error checking certification:", error);
            setIsCertified(false);
        }
    };

    const queryWorker = async () => {
        try {
            const result = await contract.methods.getWorker(workerIdQuery).call({ from: account });
            setQueriedWorker({
                name: result.name,
                certificationType: result.certificationType,
                certificationValid: result.certificationValid,
                trainingCompleted: result.trainingCompleted,
            });
        } catch (error) {
            console.error("Error querying worker data:", error);
            setQueriedWorker(null);
        }
    };

    return (
        <div>
            <h2>Certification Check on Construction Site</h2>
            <p>Account: {account}</p>

            {/* Check Certification Section */}
            <h3>Check Certification</h3>
            <input type="text" placeholder="Worker ID" onChange={(e) => setWorkerIdCheck(e.target.value)} />
            <input type="text" placeholder="Task ID" onChange={(e) => setTaskIdCheck(e.target.value)} />
            <button onClick={checkCertification}>Check Certification</button>
            {isCertified !== null && <p>Is Certified: {isCertified ? 'Yes' : 'No'}</p>}

            {/* Query Worker Data Section */}
            <h3>Query Worker Data</h3>
            <input type="text" placeholder="Worker ID" onChange={(e) => setWorkerIdQuery(e.target.value)} />
            <button onClick={queryWorker}>Query Worker</button>
            {queriedWorker && (
                <div>
                    <p><strong>Worker Name:</strong> {queriedWorker.name}</p>
                    <p><strong>Certification Type:</strong> {queriedWorker.certificationType}</p>
                    <p><strong>Certification Valid:</strong> {queriedWorker.certificationValid ? 'Yes' : 'No'}</p>
                    <p><strong>Training Completed:</strong> {queriedWorker.trainingCompleted ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
};

export default CertificationCheckApp;
