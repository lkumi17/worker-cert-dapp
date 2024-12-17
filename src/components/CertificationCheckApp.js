import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WorkerCertificationContract from '../contracts/WorkerCertification.json';

const CertificationCheckApp = () => {
    const [account, setAccount] = useState(''); // Wallet address
    const [contract, setContract] = useState(null); // Smart contract instance
    const [workerIdCheck, setWorkerIdCheck] = useState('');
    const [taskIdCheck, setTaskIdCheck] = useState('');
    const [isCertified, setIsCertified] = useState(null);

    const [workerIdQuery, setWorkerIdQuery] = useState('');
    const [queriedWorker, setQueriedWorker] = useState(null); // Queried worker details
    const [loadingWorker, setLoadingWorker] = useState(false); // Loading state for query

    useEffect(() => {
        loadBlockchainData();
    }, []);

    const loadBlockchainData = async () => {
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = WorkerCertificationContract.networks[networkId];
        if (deployedNetwork) {
            const contractInstance = new web3.eth.Contract(
                WorkerCertificationContract.abi,
                deployedNetwork.address
            );
            setContract(contractInstance);
        } else {
            alert("Smart contract not deployed to the current network.");
        }
    };

    const checkCertification = async () => {
        try {
            await contract.methods.checkCertification(workerIdCheck, taskIdCheck).send({ from: account });
            setIsCertified(true);
        } catch (error) {
            console.error("Error checking certification:", error);
            setIsCertified(false);
        }
    };

    const queryWorker = async () => {
        if (!workerIdQuery) {
            alert("Please enter a Worker ID.");
            return;
        }

        setLoadingWorker(true);
        setQueriedWorker(null);
        try {
            const result = await contract.methods.getWorker(workerIdQuery).call({ from: account });
            console.log("Worker Data:", result);

            // If no data is found, result.name will be an empty string
            if (result.name) {
                setQueriedWorker({
                    name: result.name,
                    certificationType: result.certificationType,
                    certificationValid: result.certificationValid,
                    trainingCompleted: result.trainingCompleted,
                    certificateDocument: result.certificateDocument,
                    certificationExpiry: new Date(result.certificationExpiry * 1000).toLocaleString(),
                });
            } else {
                alert("No worker found with this ID.");
            }
        } catch (error) {
            console.error("Error querying worker data:", error);
            alert("Error querying worker. Check the Worker ID and try again.");
        } finally {
            setLoadingWorker(false);
        }
    };

    return (
        <div>
            <h2>Certification Check on Construction Site</h2>
            <p><strong>Connected Account:</strong> {account}</p>

            {/* Check Certification Section */}
            <h3>Check Certification</h3>
            <input
                type="text"
                placeholder="Worker ID"
                onChange={(e) => setWorkerIdCheck(e.target.value)}
            />
            <input
                type="text"
                placeholder="Task ID"
                onChange={(e) => setTaskIdCheck(e.target.value)}
            />
            <button onClick={checkCertification}>Check Certification</button>
            {isCertified !== null && (
                <p>Is Certified: <strong>{isCertified ? 'Yes' : 'No'}</strong></p>
            )}

            {/* Query Worker Data Section */}
            <h3>Query Worker Data</h3>
            <input
                type="text"
                placeholder="Worker ID"
                onChange={(e) => setWorkerIdQuery(e.target.value)}
            />
            <button onClick={queryWorker} disabled={loadingWorker}>
                {loadingWorker ? 'Loading...' : 'Query Worker'}
            </button>

            {queriedWorker && (
                <div>
                    <p><strong>Worker Name:</strong> {queriedWorker.name}</p>
                    <p><strong>Certification Type:</strong> {queriedWorker.certificationType}</p>
                    <p><strong>Certification Valid:</strong> {queriedWorker.certificationValid ? 'Yes' : 'No'}</p>
                    <p><strong>Training Completed:</strong> {queriedWorker.trainingCompleted ? 'Yes' : 'No'}</p>
                    <p>
                        <strong>Certificate Document:</strong>{' '}
                        <a
                            href={queriedWorker.certificateDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Certificate
                        </a>
                    </p>
                    <p><strong>Certification Expiry:</strong> {queriedWorker.certificationExpiry}</p>
                </div>
            )}

            {!queriedWorker && !loadingWorker && workerIdQuery && (
                <p>No worker data available. Please check the Worker ID.</p>
            )}
        </div>
    );
};

export default CertificationCheckApp;
