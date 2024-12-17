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

    // Connect to blockchain and smart contract
    const loadBlockchainData = async () => {
        try {
            const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            // Hardcoded contract address for testing
            const hardcodedAddress = "0xc85B2420B9Afd04a406d0d1AD39d3d1Ad7E9E78F"; // Replace with your deployed contract address

            const contractInstance = new web3.eth.Contract(
                WorkerCertificationContract.abi,
                hardcodedAddress
            );
            setContract(contractInstance);

            console.log("Connected to smart contract at address:", hardcodedAddress);
        } catch (error) {
            console.error("Error loading blockchain data:", error);
            alert("Failed to connect to blockchain. Check your network or contract address.");
        }
    };

    // Check certification for a task
    const checkCertification = async () => {
        if (!workerIdCheck || !taskIdCheck) {
            alert("Please enter both Worker ID and Task ID.");
            return;
        }

        try {
            console.log("Checking certification for Worker ID:", workerIdCheck, "Task ID:", taskIdCheck);
            await contract.methods.checkCertification(workerIdCheck, taskIdCheck).send({ from: account });
            setIsCertified(true);
            alert("Worker is certified for this task.");
        } catch (error) {
            console.error("Error checking certification:", error);
            setIsCertified(false);
            alert("Worker is NOT certified for this task.");
        }
    };

    // Query worker details
    const queryWorker = async () => {
        if (!workerIdQuery) {
            alert("Please enter a Worker ID.");
            return;
        }

        setLoadingWorker(true);
        setQueriedWorker(null);

        try {
            console.log("Querying worker with ID:", workerIdQuery);
            const result = await contract.methods.getWorker(workerIdQuery).call({ from: account });
            console.log("Worker data received:", result);

            if (result.name && result.name.trim()) {
                setQueriedWorker({
                    name: result.name,
                    certificationType: result.certificationType,
                    certificationValid: result.certificationValid,
                    trainingCompleted: result.trainingCompleted,
                    certificateDocument: result.certificateDocument,
                    // Fix BigInt issue by converting to Number
                    certificationExpiry: new Date(Number(result.certificationExpiry) * 1000).toLocaleString(),
                });
            } else {
                alert("No worker data found for this ID.");
                console.warn("Empty result for Worker ID:", workerIdQuery);
            }
        } catch (error) {
            console.error("Error querying worker data:", error.message);
            alert("Failed to query worker. Check the Worker ID and try again.");
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
                onChange={(e) => setWorkerIdCheck(e.target.value.trim())}
            />
            <input
                type="text"
                placeholder="Task ID"
                onChange={(e) => setTaskIdCheck(e.target.value.trim())}
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
                onChange={(e) => setWorkerIdQuery(e.target.value.trim())}
            />
            <button onClick={queryWorker} disabled={loadingWorker || !workerIdQuery}>
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
                <p>No worker data found for Worker ID: {workerIdQuery}.</p>
            )}
        </div>
    );
};

export default CertificationCheckApp;
