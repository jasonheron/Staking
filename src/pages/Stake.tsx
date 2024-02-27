<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar/NavBar';
import SideBar from "../components/Sidebar/Index";
import NftCard from "../components/Nftcard/Index";
import StakedCard from "../components/stakedCard/Index";
import { useWallet } from '@solana/wallet-adapter-react';
import useNFTs from '../hooks/useNFTs'; // Assuming you've created this custom hook
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useNFTs from '../hooks/useNFTs'; // Custom hook to fetch NFTs
import NavBar from '../components/NavBar/NavBar'; // NavBar component
import SideBar from "../components/Sidebar/Index"; // SideBar component
import NftCard from "../components/Nftcard/Index"; // NFT card component for unstaked NFTs
import StakedCard from "../components/stakedCard/Index"; // Staked card component for staked NFTs
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'; // UMI bundle defaults
import { toast } from 'react-toastify';
import axios from 'axios';
>>>>>>> Stashed changes

const Stake = () => {
  const { publicKey } = useWallet();
  const { nfts, isLoading: isLoadingNfts } = useNFTs(publicKey);
  const [isStakedSelected, setIsStakedSelected] = useState(false);
<<<<<<< Updated upstream

  // Dummy state for staked NFTs and claimable tokens for demonstration
  const [stakedNfts, setStakedNfts] = useState([]);
  const [claimableTokens, setClaimableTokens] = useState(0);

  // Handlers for selecting staked/unstaked view
  const selectStaked = () => setIsStakedSelected(true);
  const selectUnStaked = () => setIsStakedSelected(false);

  // Dummy functions for staking, unstaking, and claiming tokens
  const stakeNft = (nftId) => {
    console.log(`Staking NFT with ID: ${nftId}`);
    // Perform staking
  };

  const unStakeNft = (nftId) => {
    console.log(`Unstaking NFT with ID: ${nftId}`);
    // Perform unstaking
  };

  const claimTokens = () => {
    console.log('Claiming tokens');
    // Perform token claiming
  };

  if (isLoadingNfts) return <div className='progress-circle'><Spinner animation="border" variant="light" /></div>;

=======
  const [claimableTokens, setClaimableTokens] = useState(0);

  const fetchClaimableTokens = useCallback(async () => {
    // Fetch logic...
  }, [publicKey]);

  useEffect(() => {
    fetchClaimableTokens();
  }, [fetchClaimableTokens]);

  const selectStaked = useCallback(() => setIsStakedSelected(true), []);
  const selectUnStaked = useCallback(() => setIsStakedSelected(false), []);

  // Staking and unstaking handlers...
  
>>>>>>> Stashed changes
  return (
    <React.Fragment>
      <NavBar /> {/* NavBar included */}
      <SideBar /> {/* SideBar included */}
      <div className='stake-page'>
        <div className='stake-container'>
<<<<<<< Updated upstream
          <NavBar />
          <div className='m-lg-4 m-mb-3 m-sm-1 m-1 row align-items-center'>
            <div className="staking-texts col-xl-9 col-lg-12 col-md-12 col-sm-12 col-12">
              <h2 className="staking-heading">Back Your Team | Staking</h2>
              <p className="staking-para">They win, you win. Each badge staked earns $asd based on real-life wins.</p>
              <p className="staking-sub-para">Gold = 50 for a win, 25 for a draw - Silver = 20 for a win, 10 for a draw - Bronze = 10 for a win, 5 for a draw.
                Badges must be staked prior to the game week to count towards $asd allocation.</p>
            </div>
            <div className="reward-box col-xl-3 col-lg-12 col-md-12 col-sm-12 col-12">
              <p className="reward-amount mb-0">{claimableTokens} $ASD</p>
              <button className="claim-btn" onClick={claimTokens}>CLAIM</button>
            </div>
          </div>

          <div className="stake-box">
            <div className="stake-unstake-btns">
              <button className={!isStakedSelected ? "border-bottom" : ""} onClick={selectUnStaked}>Unstaked</button>
              <button className={isStakedSelected ? "border-bottom" : ""} onClick={selectStaked}>Staked</button>
            </div>
            {isStakedSelected ? (
              <div className='my-lg-5 my-mb-3 my-sm-2 my-2 mx-2 staking-cards-container'>
                {/* Map over stakedNfts to display StakedCards */}
              </div>
            ) : (
              <div className='my-lg-3 my-mb-2 my-sm-2 my-2 mx-2 staking-cards-container'>
                {nfts.map((nft) => (
                  <NftCard key={nft.id} data={nft} onClick={() => stakeNft(nft.id)} />
                ))}
              </div>
            )}
          </div>
=======
          {/* Stake page content */}
          {isStakedSelected ? (
            <div className='staked-cards'>
              {/* Render Staked NFTs */}
              {nfts.map(nft => (
                <StakedCard key={nft.id} nft={nft} onUnstake={handleUnstake} />
              ))}
            </div>
          ) : (
            <div className='unstaked-cards'>
              {/* Render Unstaked NFTs */}
              {nfts.map(nft => (
                <NftCard key={nft.id} nft={nft} onStake={handleStake} />
              ))}
            </div>
          )}
>>>>>>> Stashed changes
        </div>
      </div>
    </React.Fragment>
  );
};

<<<<<<< Updated upstream
export default Stake
=======
export default Stake;
>>>>>>> Stashed changes
