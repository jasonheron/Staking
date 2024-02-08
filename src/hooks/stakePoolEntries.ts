import { useState, useEffect } from "react";
import { getProvider } from "../types/staking-func";
import * as anchor from "@project-serum/anchor"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../types/idl.json"
import useStakePoolData from "./useStakePoolData";
import { Metadata, Metaplex, Nft, Sft, token } from "@metaplex-foundation/js";
import { connection } from "../types/environment";
import axios from "axios";
import { PublicKey } from "@solana/web3.js";
import { findStakeEntryId } from "../types/staking-func"

interface nftData {
  name: String,
  imageUri: String,
  address: PublicKey,
  stakeTime?: number,
  claimedAt?: number,
}

const useStakePoolEntries = () => {

  const [stakedPoolEntries, setStakedPoolEntries] = useState<nftData[] | null>(null);
  const [unStakePoolEntries, setUnStakePoolEntries] = useState<nftData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchDone, setFetchDone] = useState(true)
  const { stakePoolData } = useStakePoolData()
  const wallet = useAnchorWallet()

  const getData = async () => {
    if (wallet) {
      setLoading(true)

      const provider = getProvider(wallet)
      const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

      const entries: any[] = await program.account.stakeEntry.all(
        [
          {
            dataSize: 124,
          },
          {
            memcmp: {
              offset: 81,
              bytes: provider.wallet.publicKey.toString(),
            },
          },
        ],
      )
    
      setStakedPoolEntries(entries)
    
      setFetchDone(false)
    
    }
    setLoading(false)
  }

  // console.log(stakePoolEntries, unStakePoolEntries)

  useEffect(() => {
    if (stakePoolData && fetchDone) {
      getData();
    }
  }, [stakePoolData, stakedPoolEntries, unStakePoolEntries]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getData();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [stakePoolData, stakedPoolEntries]);

  return (
    {stakedPoolEntries,getData}
  )
}

export default useStakePoolEntries