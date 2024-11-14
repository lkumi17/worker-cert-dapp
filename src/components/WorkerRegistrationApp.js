import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WorkerCertificationContract from '../contracts/WorkerCertification.json';

const WorkerRegistrationApp = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [workerId, setWorkerId] = useState('');
    const [workerName, setWorkerName] = useState('');
    const [certificationType, setCertificationType] = useState('');
    const [certificationValid, setCertificationValid] = useState(false);
    const [trainingCompleted, setTrainingCompleted] = useState(false);
    const [workerIdAuthorize, setWorkerIdAuthorize] = useState('');
    const [taskId, setTaskId] = useState('');

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

    const registerWorker = async () => {
        try {
            await contract.methods
                .registerWorker(workerId, workerName, certificationType, certificationValid, trainingCompleted)
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