"use client";

import { useCallback, useState } from "react";
import { createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { isTenderlyVirtualNetwork } from "~~/tenderly.config";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

export const FaucetButton = () => {
  const { chain } = useAccount();
  if (chain === undefined) {
    return null;
  }
  if (chain.id == hardhat.id) {
    return <LocalFaucetButton />;
  }
  if (isTenderlyVirtualNetwork(chain)) {
    return <TenderlyFaucetButton />;
  }
  console.log(chain);
  return null;
};

function RenderBalance(props: {
  balance?: { decimals: number; formatted: string; symbol: string; value: bigint };
  sendETH: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div
      className={
        !!props.balance?.value
          ? "ml-1"
          : "ml-1 tooltip tooltip-bottom tooltip-secondary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:right-0"
      }
      data-tip="Grab funds from faucet"
    >
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={props.sendETH} disabled={props.loading}>
        {!props.loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
}

/**
 * FaucetButton button which lets you grab eth.
 */
export const LocalFaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    try {
      setLoading(true);
      await faucetTxn({
        chain: hardhat,
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  return <RenderBalance balance={balance} sendETH={sendETH} loading={loading} />;
};

export const TenderlyFaucetButton = () => {
  const { address, chain } = useAccount();
  const tenderlyClient = createWalletClient({
    chain,
    transport: http(),
  });

  const fund = useCallback(async () => {
    if (!address) {
      return;
    }
    await tenderlyClient.request({
      //@ts-ignore
      method: "tenderly_setBalance",
      params: [address, "0x56BC75E2D63100000"],
    });
  }, [address, tenderlyClient]);

  const { data: balance } = useWatchBalance({ address });

  const [loading] = useState(false);

  return <RenderBalance balance={balance} sendETH={fund} loading={loading} />;
};
