import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ConnectWallet = () => {
    const [account, setAccount] = useState(null);

    // Function to connect wallet
    const connectWallet = async () => {
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            try {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // Get the connected account
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]); // Set the first account as the active account
            } catch (error) {
                console.error("User denied account access", error);
            }
        } else {
            alert("Please install MetaMask to use this DApp!");
        }
    };

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || null); // Update account if user switches or disconnects
            });
        }
    }, []);

    return (
        <div>
            {account ? (
                <p>Connected Account: {account}</p>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
};

export default ConnectWallet;