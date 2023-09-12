
import { useConnectWallet } from '@web3-onboard/react'
import abi from "../utils/nft.json"
import { byteCode } from '../utils/bytecode';


import { ethers } from "ethers";
import { Wallet }  from "@klaytn/ethers-ext";

const deployerAddress = "0x75Bc50a5664657c869Edc0E058d192EeEfD570eb" // oxpampam-mm
const deployerPrivateKey = "0dc23f16517e271c5840706ec89c711c9e45d8244c12d58b90107eacf9032dba"

const feePayerAddress = "0x7b467A6962bE0ac80784F131049A25CDE27d62Fb" // oxpampam-sherlock
const feePayerPrivateKey = "b2ea0b11a3e21fce9457afc0c3ae9c7df2911e312298202a2d26f0739ae7b11d"

import React, { useEffect, useState } from 'react';


export default function Home() {
  const [contract, setContract] = useState("");
  const [signerWallet, setSignerWallet] = useState("");
  const [coffee, setGetCoffee] = useState([]);
  const [nftContract, setNftContract] = useState();


  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const senderAddress = "0x75bc50a5664657c869edc0e058d192eeefd570eb" //oxpampam
  const senderPrivateKey = "0dc23f16517e271c5840706ec89c711c9e45d8244c12d58b90107eacf9032dba"

  const feePayerAddress = "0x7b467a6962be0ac80784f131049a25cde27d62fb" //oxpampam-sherlock
  const feePayerPrivateKey = "b2ea0b11a3e21fce9457afc0c3ae9c7df2911e312298202a2d26f0739ae7b11d"

  const contractAddress = "0x9011B377D649Ec158BEf46276de247991A961Be9"


  // const getCoffee = async () => {
  //   try {

  //      console.log("getting coffee Id")

  //      const coffeeId = await coffeeContract.coffeeId();
  //      console.log(coffeeId.toString());

  //      const getCoffee = await coffeeContract.getAllCoffee(coffeeId.toString());

  //      setGetCoffee(getCoffee);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {

    let ethersProvider;

    if (wallet) {
      //  ethersProvider = new ethers.BrowserProvider(wallet.provider, 'any');
       ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any")
    }
  
    if (ethersProvider) {
      try {
        const getNftContract = async () => {

          const signerWallet = new Wallet(
            senderPrivateKey, 
            ethersProvider
          );
          const nftContract = new ethers.Contract(contractAddress, abi, signerWallet);
          console.log(nftContract);
          
          setNftContract(nftContract);
          setSignerWallet(signerWallet);
        }

        getNftContract();
      } catch (error) {
        console.log(error);
      }
    }

  }, [wallet])

  const mintNFT = async (e) => {
    e.preventDefault();
    try {

      if (!wallet && !nftContract) {
        console.log("provider not initialized yet");
        return;
      }

      console.log("minting certificate..")
      
      const param = nftContract.interface.encodeFunctionData("mintNFT"); 

      let tx = {
          type: 0x31,
          to: contractAddress,
          value: 0,  
          from: senderAddress,
          input: param,
        }; 

      tx = await signerWallet.populateTransaction(tx);
      console.log(tx);

      const senderTxHashRLP = await signerWallet.signTransaction(tx);
      console.log('senderTxHashRLP', senderTxHashRLP);

      // fee payer
      const feePayerWallet = new Wallet(feePayerPrivateKey, wallet.provider);

      tx = feePayerWallet.decodeTxFromRLP( senderTxHashRLP );
      tx.feePayer = feePayerAddress;
      console.log(tx);

      const sentTx = await feePayerWallet.sendTransactionAsFeePayer(tx);
      console.log('sentTx', sentTx);

      const rc = await sentTx.wait();
      console.log('receipt', rc);

    } catch (error) {
      console.log(error);
    }
  };


  return (
     <main className='coffeeMain max-w-8xl min-h-[100vh] p-10 bg-black mt-0 shadow-2xl m-auto flex flex-col justify-center items-center bg-[url("data:image/jpeg;base64,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")] bg-no-repeat bg-cover'>
        <div className='coffeContent'>
          <div className='compOne flex flex-col justify-center items-center bg-black p-10 rounded-2xl h-64'>
            <h1 className='text-white text-center text-2xl'>Certificate Minting</h1>
            { wallet ?
            ( <div>
                <form onSubmit={mintNFT} className="flex flex-col justify-center items-center mt-4">
                  <p className='text-white font-bold text-center'>Thank you for participating in Klaytn Developer Bootcamp</p>
                  {/* <input type="text" name='inputName' placeholder="Enter your name" className="p-5 rounded-md bg-black text-white border-solid border-2 border-white outline-0" onChange={onNameChange} />
                  <input type="text" name='inputAmount' placeholder="Send your message" className="p-5 rounded-md bg-black text-white border-solid border-2 border-white mt-3 outline-0" onChange={onMessageChange}/> */}
                  <input type="submit" value="Mint your certificate" className="p-3 mt-4 rounded-2xl bg-white text-black cursor-pointer"/>
                </form>
            </div> ) : ( <button className='text-white bg-black border p-3 rounded-lg mt-3 cursor-pointer' disabled={connecting} onClick={() => (wallet ? disconnect(wallet) : connect())}>
        {connecting ? 'Connecting' : wallet ? 'Disconnect' : 'Connect'}
      </button>)
        
            }
          </div>
          
        </div>
    </main>
  )
}