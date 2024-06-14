'use client'

import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import '@/app/type/SignUpForm.css'

const SignUpForm = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [amount, setAmount] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('Đang yêu cầu truy cập MetaMask...');
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const address = accounts[0];

        setWalletAddress(address);
        setIsConnected(true);
        setErrorMessage('');
      } catch (error) {
        console.log(error);
        alert('Không thể kết nối với MetaMask');
      }
    } else {
      alert('MetaMask chưa được cài đặt');
    }
  };

  const handleManualAddressChange = (e) => {
    setManualAddress(e.target.value);
  };
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleManualConnect = () => {
    setWalletAddress(manualAddress);
    setIsConnected(true);
    setManualAddress('');
    setErrorMessage('');
  };
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

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

   
      
          const tx = await signer.sendTransaction({
            to: manualAddress,
            value: ethers.utils.parseEther(amount),
            
          });

      alert(`Giao dịch thành công! Hash: ${tx.hash}`);
    } catch (error) {
      console.error('Giao dịch thất bại:', error);
      alert('Giao dịch thất bại');
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
                <Button type="primary" onClick={connectWallet}>Kết nối với MetaMask</Button>
              </td>
            </tr>
            {isConnected && (
              <>
                <tr>
                  <td style={tableCellStyle}>
                    <Input
                      value={manualAddress}
                      onChange={handleManualAddressChange}
                      placeholder="Nhập địa chỉ ví nhận"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>
                    <Input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Nhập số lượng ETH"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <Button type="primary" onClick={handleSubmit}>Gửi</Button>
                  </td>
                </tr>
                <tr>
                  <td style={tableCellStyle}>
                    Địa chỉ ví đã kết nối: {walletAddress}
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
