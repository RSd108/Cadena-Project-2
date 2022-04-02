import './App.css';
import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/RadhaCoin.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xE644a62Bf961B7541AA182ee7E17F8216D29F1B9';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)

        setTokenName(`${tokenName}`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true)
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        await txn.wait();
        console.log("Tokens Transfered", txn.hash);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
        console.log("Minting tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  })

  return (
    <main className="App">
      <h2 className="App-header">
        <span>Radha Coin Project
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvCljbP1OzBZykt3AAls_7OlDJ0goe5nxATw&usqp=CAU" alt="Radha Coin" width="60" height="30" />
        </span>
      </h2>
      <section>
        {error && <p>{error}</p>}
        <div>
          <span><strong>Coin:</strong> {tokenName} 
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvCljbP1OzBZykt3AAls_7OlDJ0goe5nxATw&usqp=CAU" alt="Radha Coin" width="30" height="15" />
          </span>
          <span><strong>Ticker:</strong>  {tokenSymbol} </span>
          <span><strong>Total Supply:</strong>  {tokenTotalSupply}</span>
        </div>
        <div>
          <form>
            <input
              type="text"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="Wallet Address"
              value={inputValue.walletAddress}
            />
            <input
              type="text"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button
              onClick={transferToken}>Transfer Tokens</button>
          </form>
        </div>
        {isTokenOwner && (
          <section>
            <div>
              <form>
                <input
                  type="text"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <button
                  onClick={burnTokens}>
                  Burn Tokens
                </button>
              </form>
            </div>
            <div>
              <form>
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <button
                  onClick={mintTokens}>
                  Mint Tokens
                </button>
              </form>
            </div>
          </section>
        )}
        <div>
          <p><span className="font-bold">Contract Address: </span>{contractAddress}</p>
        </div>
        <div>
          <p><span className="font-bold">Token Owner Address: </span>{tokenOwnerAddress}</p>
        </div>
        <div>
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{yourWalletAddress}</p>}
          <button onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>

      </section>
    </main>
  );
}
export default App;