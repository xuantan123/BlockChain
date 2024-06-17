'use client'

import React, { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import contractABI from '@/app/components/abi.json'
import '@/app/type/SignUpForm.css'

const contractAddress = '0x47a068adfCA61245BE0Bae7388f6f56B4e6C2575';

const SignUpForm = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [balance, setBalance] = useState('');
  const [receiverBalance, setReceiverBalance] = useState('');

  useEffect(() => {
    console.log('Contract abi',contractABI);
  },[]);
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('Đang yêu cầu truy cập MetaMask...');
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const address = accounts[0];

        setWalletAddress(address);
        setIsConnected(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
         

        const nonce = await provider.getTransactionCount(address);
        setTransactionCount(nonce);

        const contract = new ethers.Contract(contractAddress, contractABI,signer);
        setContractInstance(contract);
        console.log('Đã kết nối với hợp đồng:', contract.interface.getFunction('mint'));
      } catch (error) {
        console.log(error);
        alert('Không thể kết nối với MetaMask');
      }
    } else {
      alert('MetaMask chưa được cài đặt');
      setReceiverBalance('');
    }
  };

  const handleManualAddressChange = (e) => {
    setManualAddress(e.target.value);
  };
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const getReceiverBalance = async () => {
    try {
      if (!ethers.utils.isAddress(manualAddress)) {
        alert('Địa chỉ ví không hợp lệ');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(manualAddress);
      setReceiverBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Failed to fetch receiver balance:', error);
      alert('Failed to fetch receiver balance');
    }
  }
  const handleSubmit = async () => {
    try {
      if (!ethers.utils.isAddress(manualAddress)) {
        alert('Địa chỉ ví không hợp lệ');
        return;
      }

      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert('Số lượng ETH không hợp lệ');
        return;
      }
      if(!contractInstance){
        alert('Hợp đồng chưa được kết nối');
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress,contractABI,signer);
      
      const amountToMint = ethers.utils.parseEther(amount);
      const accountToReceive = manualAddress;
      const ht = await contract.mint(amountToMint, accountToReceive);
      console.log('Transaction hash:', ht.hash);
      
      const tx = await signer.sendTransaction({
          to: manualAddress,
          value: ethers.utils.parseEther(amount),
            
      });

      
        
      alert(`Transaction successful! Hash: Hash: ${tx.hash}`);

      const updatedBalance = await provider.getBalance(walletAddress);
      setBalance(ethers.utils.formatEther(updatedBalance));

      const receiverBalance = await provider.getBalance(manualAddress);
      setReceiverBalance(ethers.utils.formatEther(receiverBalance));

    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed');
    }
  };
 

  const formContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh', 
    background: '#f0f2f5',
    padding: '20px',
  };

 
 
  const tableStyle = {
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    padding: '100px',
    width: '100%',
    maxWidth: '400px', 
    background: '#fff',
  };
  const tableCellStyle = {
    padding: '16px',
    borderBottom: '1px solid #ddd'
  };

  return (
    <div className='App'>
      <div className='form-Container' style={formContainerStyle}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={tableCellStyle}>
                <Button type="primary" onClick={connectWallet}>Connect WalletMetaMask</Button>
              </td>
            </tr>
            {isConnected && (
              <>
                <tr>
                  <td style={tableCellStyle}>
                    <Input
                      value={manualAddress}
                      onChange={handleManualAddressChange}
                      placeholder="Address MetaMask"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>
                    <Input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="ETH"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>
                    Wallet balance: {balance} 
                  </td>
                </tr> 
                <tr>
                  <td style={tableCellStyle}> 
                    Receiver balance:{receiverBalance && <p>{receiverBalance} ETH</p>}
                  </td>
                </tr>
                <tr>
                <td style={tableCellStyle}>
                    Transaction count: {transactionCount}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <Button type="primary" onClick={handleSubmit}>Send</Button>
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>
                  Connected wallet address: {walletAddress}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <div id="transactionHistory" style={{ padding: '20px' }}></div>
    </div>
  );
};

export default SignUpForm;
