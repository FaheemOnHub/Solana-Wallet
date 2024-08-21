import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
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
const DELNET_ENDPOINT = "https://api.devnet.solana.com";
export function SolanaWallet({ mnemonic }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connection, setConnection] = useState(null);
  const [balances, setBalances] = useState({});
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [solanaWallets, setSolanaWallets] = useState([]);

  useEffect(() => {
    setSolanaWallets([]);
    const conn = new Connection(DELNET_ENDPOINT);
    setConnection(conn);
  }, []);
  const copyToClipboard = (privateKey) => {
    navigator.clipboard.writeText(privateKey).then(() => {
      alert("Private Key copied to clipboard");
    });
  };
  const getBalance = async (publicKey) => {
    if (connection) {
      const balance = await connection.getBalance(publicKey);
      console.log(balance);
      setBalances((prev) => ({
        ...prev,
        [publicKey.toBase58()]: balance / LAMPORTS_PER_SOL,
      }));
    }
  };
  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={async function () {
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
      {solanaWallets.map((wallet, index) => (
        <div className="flex flex-col gap-2" key={index}>
          <h2 className="text-2xl font-bold text-center">
            Wallet {index + 1 + ":"}
          </h2>
          <div className="flex flex-col">
            <div>{"Public Key:" + wallet.publicKey.toBase58()}</div>
            <div className="flex justify-between">
              <span>
                {"Private Key:" +
                  Buffer.from(wallet.secretKey).toString("hex").slice(0, 10) +
                  "..."}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(Buffer.from(wallet.secretKey).toString("hex"))
                }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
              >
                Copy
              </button>
            </div>
            <div>Balance: {balances[wallet.publicKey.toBase58()] || 0} SOL</div>
            <button
              onClick={() => getBalance(wallet.publicKey)}
              className="btn btn-secondary"
            >
              Check Balance
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default SolanaWallet;
