import React, { useState, useEffect, useCallback } from 'react';
import useNFTs from './hooks/useNFTs';
import NftCard from "./components/Nftcard/Index";
import { useWallet } from '@solana/wallet-adapter-react';

const Stake = () => {
  const { publicKey } = useWallet();
  const { nfts, isLoading: isLoadingNfts } = useNFTs(publicKey);
  const [isStakedSelected, setIsStakedSelected] = useState(false);

  const selectStaked = useCallback(() => setIsStakedSelected(true), []);
  const selectUnStaked = useCallback(() => setIsStakedSelected(false), []);

  // Example stake and unstake functions
  const stakeNft = useCallback((nftId) => {
    console.log(`Staking NFT with ID: ${nftId}`);
    // Perform staking
  }, []);

  if (isLoadingNfts) return <div>Loading NFTs...</div>;

  return (
    <div className='stake-page'>
      <button onClick={selectUnStaked}>Unstaked</button>
      <button onClick={selectStaked}>Staked</button>
      <div>
        {nfts.map((nft) => (
          <div key={nft.id} onClick={() => stakeNft(nft.id)}>
            <NftCard data={nft} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stake;
