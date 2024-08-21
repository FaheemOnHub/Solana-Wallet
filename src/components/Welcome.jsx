import React from "react";
import { useState } from "react";
import { generateMnemonic } from "bip39";
import { useNavigate } from "react-router-dom";
function Welcome() {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const generateMnemonicFuntion = () => {
    const newMemonic = generateMnemonic();
    setMnemonic(newMemonic);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mnemonic).then(() => {
      alert("Mnemonic copied to clipboard");
    });
  };
  return (
    <main className="flex flex-col items-center justify-center ">
      <div className="text-2xl font-bold">Welcome to bip-Wallet</div>
      {!mnemonic && (
        <button
          className="btn btn-primary mt-10"
          onClick={generateMnemonicFuntion}
        >
          Generate Mnemonics
        </button>
      )}

      {mnemonic && (
        <div className="mt-10 ">
          <h3 className="text-2xl font-bold">Generated Mnemonic</h3>
          <div className="flex flex-wrap max-w-xs gap-2 mt-10">
            {mnemonic.split(" ").map((word) => (
              <span className="bg-gray-100 rounded px-2 py-1 ">{word}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={copyToClipboard}
              className="btn btn-secondary mt-4 "
            >
              Copy to clipboard
            </button>
            <button
              onClick={() => navigate("/wallet")}
              className="btn btn-secondary mt-4 "
            >
              Go to wallet
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Welcome;
