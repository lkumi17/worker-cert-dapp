import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WorkerCertificationContract from '../contracts/WorkerCertification.json';
import axios from 'axios'; // Use axios for Pinata API calls

const WorkerRegistrationApp = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [workerId, setWorkerId] = useState('');
    const [workerName, setWorkerName] = useState('');
    const [certificationType, setCertificationType] = useState('');
    const [certificationValid, setCertificationValid] = useState(false);
    const [trainingCompleted, setTrainingCompleted] = useState(false);
    const [certificateFile, setCertificateFile] = useState(null);
    const [certificationExpiry, setCertificationExpiry] = useState('');
    const [workerIdAuthorize, setWorkerIdAuthorize] = useState('');
    const [taskId, setTaskId] = useState('');

    const PINATA_API_KEY = 'd3df458dc019258652fa';
    const PINATA_SECRET_KEY = 'aa470e78a777eaa939153adce0618d26127a127eb8ca51a9833f69d30c0b01a4';

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
            alert("Smart contract not deployed to the current network");
        }
    };

    const uploadToPinata = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            });
            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
            return ipfsUrl;
        } catch (error) {
            console.error("Error uploading file to Pinata:", error);
            throw error;
        }
    };

    const registerWorker = async () => {
        try {
            let certificateUrl = '';
            if (certificateFile) {
                certificateUrl = await uploadToPinata(certificateFile);
            }
            const expiryTimestamp = Math.floor(new Date(certificationExpiry).getTime() / 1000);

            await contract.methods
                .registerWorker(workerId, workerName, certificationType, certificationValid, trainingCompleted, certificateUrl, expiryTimestamp)
                .send({ from: account, gas: 3000000 });

            alert("Worker Registered Successfully!");
        } catch (error) {
            console.error("Error registering worker:", error);
            alert("Error registering worker: " + error.message);
        }
    };

    const authorizeTask = async () => {
        try {
            await contract.methods
                .authorizeTask(workerIdAuthorize, taskId)
                .send({ from: account, gas: 3000000 });
            alert("Task Authorized Successfully!");
        } catch (error) {
            console.error("Error authorizing task:", error);
            alert("Error authorizing task: " + error.message);
        }
    };

    return (
        <div>
            <h2>Worker Registration and Authorization</h2>
            <p><strong>Connected Account:</strong> {account}</p>

            {/* Register Worker Section */}
            <h3>Register Worker</h3>
            <input type="text" placeholder="Worker ID" onChange={(e) => setWorkerId(e.target.value)} />
            <input type="text" placeholder="Worker Name" onChange={(e) => setWorkerName(e.target.value)} />
            <input type="text" placeholder="Certification Type" onChange={(e) => setCertificationType(e.target.value)} />
            <input type="file" onChange={(e) => setCertificateFile(e.target.files[0])} />
            <input type="date" placeholder="Certification Expiry" onChange={(e) => setCertificationExpiry(e.target.value)} />
            <label>
                <input type="checkbox" onChange={(e) => setCertificationValid(e.target.checked)} /> Certification Valid
            </label>
            <label>
                <input type="checkbox" onChange={(e) => setTrainingCompleted(e.target.checked)} /> Training Completed
            </label>
            <button onClick={registerWorker}>Register Worker</button>

            {/* Authorize Task Section */}
            <h3>Authorize Task</h3>
            <input type="text" placeholder="Worker ID" onChange={(e) => setWorkerIdAuthorize(e.target.value)} />
            <input type="text" placeholder="Task ID" onChange={(e) => setTaskId(e.target.value)} />
            <button onClick={authorizeTask}>Authorize Task</button>
        </div>
    );
};

export default WorkerRegistrationApp;
