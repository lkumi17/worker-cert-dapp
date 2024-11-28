import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WorkerCertificationContract from '../contracts/WorkerCertification.json';
import { create } from 'ipfs-http-client';

const WorkerRegistrationApp = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [workerId, setWorkerId] = useState('');
    const [workerName, setWorkerName] = useState('');
    const [certificationType, setCertificationType] = useState('');
    const [certificationValid, setCertificationValid] = useState(false);
    const [trainingCompleted, setTrainingCompleted] = useState(false);
    const [certificateDocument, setCertificateDocument] = useState('');
    const [certificationExpiry, setCertificationExpiry] = useState('');
    const [workerIdAuthorize, setWorkerIdAuthorize] = useState('');
    const [taskId, setTaskId] = useState('');
    const [ipfs, setIpfs] = useState(null);

    useEffect(() => {
        loadBlockchainData();
        const client = create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https'
        });
        setIpfs(client);
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

    const uploadToIpfs = async (file) => {
        try {
            const added = await ipfs.add(file);
            return `https://ipfs.infura.io/ipfs/${added.path}`;
        } catch (error) {
            console.error("Error uploading file to IPFS:", error);
            throw error;
        }
    };

    const registerWorker = async () => {
        try {
            let certificateUrl = certificateDocument;
            if (certificateDocument instanceof File) {
                certificateUrl = await uploadToIpfs(certificateDocument);
            }
            const expiryTimestamp = Math.floor(new Date(certificationExpiry).getTime() / 1000);
            await contract.methods
                .registerWorker(workerId, workerName, certificationType, certificationValid, trainingCompleted, certificateUrl, expiryTimestamp)
                .send({ from: account, gas: 3000000 });
            alert("Worker Registered");
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
            alert("Task Authorized");
        } catch (error) {
            console.error("Error authorizing task:", error);
            alert("Error authorizing task: " + error.message);
        }
    };

    return (
        <div>
            <h2>Worker Registration and Authorization</h2>
            <p>Account: {account}</p>

            {/* Register Worker Section */}
            <h3>Register Worker</h3>
            <input type="text" placeholder="Worker ID" onChange={(e) => setWorkerId(e.target.value)} />
            <input type="text" placeholder="Worker Name" onChange={(e) => setWorkerName(e.target.value)} />
            <input type="text" placeholder="Certification Type" onChange={(e) => setCertificationType(e.target.value)} />
            <input type="file" onChange={(e) => setCertificateDocument(e.target.files[0])} />
            <input type="date" placeholder="Certification Expiry" onChange={(e) => setCertificationExpiry(e.target.value)} />
            <input type="checkbox" onChange={(e) => setCertificationValid(e.target.checked)} /> Certification Valid
            <input type="checkbox" onChange={(e) => setTrainingCompleted(e.target.checked)} /> Training Completed
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
