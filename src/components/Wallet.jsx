import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { useLocation } from "react-router-dom";
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import nacl from "tweetnacl";
import IsLoading from "./isLoading";
const DELNET_ENDPOINT = "https://api.devnet.solana.com";
export function SolanaWallet() {
  const location = useLocation();
  const mnemonic = location.state?.mnemonic;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connection, setConnection] = useState(null);
  const [balances, setBalances] = useState({});
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [solanaWallets, setSolanaWallets] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    console.log("useEffect called, resetting solanaWallets");

    const conn = new Connection(DELNET_ENDPOINT);
    setConnection(conn);
  }, []);
  const copyToClipboard = (privateKey) => {
    navigator.clipboard.writeText(privateKey).then(() => {
      alert(" Key copied to clipboard");
    });
  };
  const getBalance = async (publicKey) => {
    try {
      if (connection) {
        setLoadingStates((prev) => ({ ...prev, [publicKey.toBase58()]: true }));
        const balance = await connection.getBalance(publicKey);
        console.log(balance);

        setBalances((prev) => ({
          ...prev,
          [publicKey.toBase58()]: balance / LAMPORTS_PER_SOL,
        }));
        setLoadingStates((prev) => ({
          ...prev,
          [publicKey.toBase58()]: false,
        }));
      }
    } catch (error) {
      setLoadingStates((prev) => ({ ...prev, [publicKey.toBase58()]: false }));
      console.log(error);
    }
  };
  const requestAirdrop = async (publicKey) => {
    if (connection) {
      setLoadingStates((prev) => ({ ...prev, [publicKey.toBase58()]: true }));
      const signature = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      await getBalance(publicKey);
    }
  };
  const sendTransaction = async (senderWallet, recipientAddress, amount) => {
    if (!connection || !recipientAddress) {
      alert("Connection or recipient address is missing");
      return;
    }
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderWallet.publicKey,
          toPubkey: recipientAddress,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [senderWallet]
      );
      console.log("Transaction sent:", signature);
      alert("Transaction successful");
      await getBalance(senderWallet.publicKey);
    } catch (error) {}
  };
  return (
    <div className="flex flex-col gap-2 flex-wrap max-h-[100vh]">
      <button
        className="btn btn-primary"
        onClick={async function () {
          if (solanaWallets.length >= 10) {
            alert("You can only have up to 10 wallets");
            return;
          }
          const seed = await mnemonicToSeed(mnemonic);
          const path = `m/44'/501'/${currentIndex}'/0'`;
          const derivedSeed = derivePath(path, seed.toString("hex")).key;
          const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
          const keypair = Keypair.fromSecretKey(secret);
          setCurrentIndex(currentIndex + 1);
          //   setPublicKeys([...publicKeys, keypair.publicKey]);
          setSolanaWallets([...solanaWallets, keypair]);
          //   setPrivateKeys([...privateKeys, keypair.secretKey]);
        }}
      >
        Add SOL wallet
      </button>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4 flex-col">
          {solanaWallets.map((wallet, index) => (
            <div
              className="flex-shrink-0 w-64 bg-base-200 p-4 rounded-lg"
              key={index}
            >
              <h2 className="text-2xl font-bold text-center">
                Wallet {index + 1 + ":"}
              </h2>
              <div className="flex flex-col">
                <div>
                  {"Public Key:" + wallet.publicKey.toBase58().slice(0, 10)}
                  <button
                    onClick={() => copyToClipboard(wallet.publicKey.toBase58())}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-between">
                  <span>
                    {"Private Key:" +
                      Buffer.from(wallet.secretKey)
                        .toString("hex")
                        .slice(0, 10) +
                      "..."}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Buffer.from(wallet.secretKey).toString("hex")
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div>
                  Balance: {balances[wallet.publicKey.toBase58()] || "0"} SOL
                </div>
                <button
                  onClick={() => getBalance(wallet.publicKey)}
                  className="btn btn-secondary btn-sm w-full"
                >
                  Check Balance
                </button>
                {loadingStates[wallet.publicKey.toBase58()] && <IsLoading />}
                <button
                  className="btn btn-secondary btn-sm mt-4"
                  onClick={() => requestAirdrop(wallet.publicKey)}
                >
                  Request Airdrop (1 SOL)
                </button>
              </div>
              <div>
                <p className="text-sm mx-auto p-2">
                  {" "}
                  Transfer SOL from this wallet
                </p>
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="input input-bordered w-full"
                />
                <input
                  type="number"
                  placeholder="Amount in SOL"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input input-bordered w-full mt-2"
                />
                <button
                  className="btn btn-primary mt-2 w-full"
                  onClick={() =>
                    sendTransaction(
                      wallet,
                      recipientAddress,
                      parseFloat(amount)
                    )
                  }
                >
                  Send SOL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default SolanaWallet;
