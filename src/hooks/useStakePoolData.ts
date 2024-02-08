import {useState, useEffect} from "react";
import { getProvider } from "../types/staking-func";
import * as anchor from "@project-serum/anchor"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../types/idl.json"
import { PublicKey } from "@solana/web3.js";

const useStakePoolData = () => {
    const [stakePoolMetadata, setStakePoolMetadata] = useState<any>()
    const wallet = useAnchorWallet()

    // const stakePoolId : string = "2Wje98zV2Ut3f79swB3opyTPCjG3aXm4qAxysBoHURbB"
    const stakePoolId : string = "AnUoD7qd7CgzQhAQMsEMxU5YN3Mpo3yLiFMzJWgJcsER"

    const getData = async () => {
        if(wallet){
            const provider = getProvider(wallet)
            const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);
            const pool = await program.account.pool.fetch(new PublicKey(stakePoolId));
              setStakePoolMetadata(pool);

        }
    }

    useEffect(()=>{
        getData();
    },[wallet])

    useEffect(() => {
        const intervalId = setInterval(() => {
          getData();
        }, 30 * 1000); // 30 seconds
    
        return () => clearInterval(intervalId); 
      }, [wallet]);


//   return ({stakePoolData : {poolId : new PublicKey(stakePoolId),...stakePoolMetadata}, refetchStakePoolData : getData})
  return ({stakePoolData : {poolId : new PublicKey(stakePoolId),...stakePoolMetadata}, refetchStakePoolData : getData})

}

export default useStakePoolData