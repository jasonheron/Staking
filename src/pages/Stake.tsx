import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar/NavBar'
import SideBar from "../components/Sidebar/Index"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { Navigation } from 'swiper/modules';
import NftCard from "../components/Nftcard/Index"
import StakedCard from "../components/stakedCard/Index"
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { PublicKey, Transaction } from '@solana/web3.js';
import { stakeCnft, unStakeCnft, teams, getProvider, getStakeEntry, findStakeEntryId, claimCnftsTokens } from '../types/staking-func';
import * as anchor from "@project-serum/anchor"
import { connection } from '../types/environment';
import useStakePoolData from '../hooks/useStakePoolData';
import useStakePoolEntries from '../hooks/stakePoolEntries';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import idl from "../types/idl.json"
import axios from 'axios';


const umi = createUmi(connection.rpcEndpoint);

const goldWinAmount = 50;
const silverWinAmount = 20;
const bronzeWinAmount = 10;
const season = 2023;

const Stake = () => {

  // const { publicKey } = useWallet()
  const { publicKey, signTransaction } = useWallet()
  const wallet = useAnchorWallet()
  const [isStakedSelected, setIsStakedSelected] = useState<boolean>(false)
  const [stakeNftList, setStakeNftList] = useState<any[]>([])
  const [unStakeNftList, setUnStakeNftList] = useState<any[]>([])
  const [tree, setTree] = useState<String>("")
  const [cnfts, setCnfts] = useState<any>()
  const [stakedCnfts, setstakedCnfts] = useState<any>()
  const { stakePoolData } = useStakePoolData()
  const {stakedPoolEntries,getData} = useStakePoolEntries();
  const [fetchDone, setFetchDone] = useState(true)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [claimableTokens, setClaimableTokens] = useState<number>(0)
  umi.use(dasApi())

  const getCnfts = async () => {
    try {
      if (!publicKey) return
      setIsLoading(true)
      //@ts-ignore
      const rpcAssetList = await umi.rpc.getAssetsByOwner({ owner: publicKey })
      const compressedNfts = rpcAssetList.items.filter((item: any) => item.compression.compressed == true)
      let filteredArray = compressedNfts.filter((creatorArray: any) =>
        creatorArray.creators.some((creator: any) => creator.address === stakePoolData?.allowedCreators?.toString())
      );
      setCnfts(filteredArray)


      setFetchDone(false)
      setIsLoading(false)

    } catch (e) {
      console.log(e)
      setFetchDone(false)
      setIsLoading(false)

    }
  }

  const getStakedCnfts = async () => {
    try {
      if (!publicKey) return
      if (!wallet) return
      if (!stakedPoolEntries) return
      setIsLoading(true)
      const provider = getProvider(wallet)
      const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

      let allstakedCnfts: any[] = []

      let amountToTransfer = 0

      for (let entry of stakedPoolEntries) {
        // console.log(entry)
        //@ts-ignore
        const asset = await umi.rpc.getAsset(entry?.account?.stakeMint)
        //@ts-ignore
        const stakeEntry = findStakeEntryId(stakePoolData.poolId, entry?.account?.stakeMint)

        const nftData: any = await program.account.stakeEntry.fetch(stakeEntry.toString())
        allstakedCnfts.push({data : asset,chainData : nftData})
        // console.log("asser",asset)
      let filteredAttr = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Rarity')[0];
      let filteredTeam = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Team')[0];

      //@ts-ignore
      let filteredTeamId = teams.filter((team:any)=>team.name===filteredTeam.value)[0];
      
      
      const date = new Date(nftData.lastStakedAt.toNumber() * 1000);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with zero
      const day = String(date.getDate()).padStart(2, '0');

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with zero
      const currentDay = String(currentDate.getDate()).padStart(2, '0');

      const startDate = `${year}-${month}-${day}`;
      const endDate = `${currentYear}-${currentMonth}-${currentDay}`;

      // const demoStartDate = '2023-12-01';
      // const demoEndDate = '2023-12-30';

      // console.log(startDate, endDate)


      let matchesData : any;
      await axios.get(`https://api-football-v1.p.rapidapi.com/v3/fixtures?season=${season}&team=${filteredTeamId.id}&league=39&from=${startDate}&to=${endDate}`,{
          headers: {
            'X-RapidAPI-Key' : '19978d8ad8msh966959f511c0cedp1fbbacjsnd4ed69eb1e78'
          }
        }).then((res)=>{
          matchesData = res.data.response;
        })

        if(matchesData.length > 0){
          for(let match of matchesData){
            if(match.teams.home.winner === null && match.teams.away.winner === null){
              if(filteredAttr?.value === 'Gold'){
                amountToTransfer += goldWinAmount/2;
              }else if(filteredAttr?.value === 'Silver'){
                amountToTransfer += silverWinAmount/2;
              }else if(filteredAttr?.value === 'Bronze'){
                amountToTransfer += bronzeWinAmount/2;
              }
            }else if(match.teams.home.winner === true && match.teams.home.id===filteredTeamId.id){
              if(filteredAttr?.value === 'Gold'){
                amountToTransfer += goldWinAmount;
              }else if(filteredAttr?.value === 'Silver'){
                amountToTransfer += silverWinAmount;
              }else if(filteredAttr?.value === 'Bronze'){
                amountToTransfer += bronzeWinAmount;
              }
            }else if(match.teams.away.winner === true && match.teams.away.id===filteredTeamId.id){
              if(filteredAttr?.value === 'Gold'){
                amountToTransfer += goldWinAmount;
              }else if(filteredAttr?.value === 'Silver'){
                amountToTransfer += silverWinAmount;
              }else if(filteredAttr?.value === 'Bronze'){
                amountToTransfer += bronzeWinAmount;
              }
            }
          }
        }




      }
      setClaimableTokens(amountToTransfer)

      setstakedCnfts(allstakedCnfts)
      setFetchDone(false)
      setIsLoading(false)



    } catch (e) {
      console.log(e)
      setFetchDone(false)
      setIsLoading(false)

    }
  }


  const stakeNfts = async () => {
    try {
      if (publicKey && wallet) {
        if (!wallet) {
          return
        }

        if (stakeNftList.length <= 0) {
          toast.error("Please Select Nfts To Stake !")
          return
        }

        if (!stakePoolData) return

        const allTx: Transaction[] = [];

        for (let entry of stakeNftList) {
          const tx: Transaction | undefined = await stakeCnft(wallet, new PublicKey(entry), stakePoolData.poolId, tree)
          if (!tx) {
            return
          }
          tx.feePayer = publicKey
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          allTx.push(tx)
        }
        const signedTxs = await wallet.signAllTransactions(allTx)

        for (let tx of signedTxs) {
          await connection.sendRawTransaction(
            tx.serialize(),
            {
              skipPreflight: false
            }
          )
        }

        getData()
        setTimeout(() => {
          getCnfts()
          getStakedCnfts()
        }, 5000);
        setUnStakeNftList([])
        setStakeNftList([]);
        toast.success("Staked Succesfully")
      }
    } catch (e: any) {
      toast.error(e.message)
      console.log(e)
    }

  }

  const unStakeNfts = async () => {
    try {
      if (publicKey && wallet) {
        if (!wallet) {
          return
        }

        if (unStakeNftList.length <= 0) {
          toast.error("Please Select Nfts To UnStake !")
          return
        }

        if (!stakePoolData) return

        const allTx: Transaction[] = [];

        for (let entry of unStakeNftList) {
          const tx: Transaction | undefined = await unStakeCnft(wallet, new PublicKey(entry), stakePoolData.poolId, tree)
          if (!tx) {
            return
          }
          tx.feePayer = publicKey
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          allTx.push(tx)

          const txn: Transaction | undefined = await claimCnftsTokens(wallet, new PublicKey(entry), stakePoolData.poolId)
          if (!txn) {
            return
          }
          txn.feePayer = publicKey
          txn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          allTx.push(txn)
        }

        // console.log(allTx)

        const signedTxs = await wallet.signAllTransactions(allTx)


        for (let tx of signedTxs) {
          await connection.sendRawTransaction(
            tx.serialize(),
            {
              skipPreflight: false
            }
          )
        }

        getData()
        setTimeout(() => {
          getCnfts()
          getStakedCnfts()
        }, 5000);
        setUnStakeNftList([])
        setStakeNftList([]);
        toast.success("Unstaked Succesfully")
      }
    } catch (e: any) {
      if(e.message.includes('0x1773')){
        toast.error('You cannot unstake NFT at the moment')
      }else{
        toast.error(e.message)
      }
      console.log(e)
    }

  }

  const claimTokens = async () => {
    try {
      if (publicKey && wallet) {
        if (!wallet) {
          return
        }

        if (unStakeNftList.length <= 0) {
          toast.error("Please Select Nfts To Claim !")
          return
        }

        if (!stakePoolData) return

        const allTx: Transaction[] = [];

        for (let entry of unStakeNftList) {
          const tx: Transaction | undefined = await claimCnftsTokens(wallet, new PublicKey(entry), stakePoolData.poolId)
          if (!tx) {
            return
          }
          tx.feePayer = publicKey
          tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
          allTx.push(tx)
        }
        const signedTxs = await wallet.signAllTransactions(allTx)

        for (let tx of signedTxs) {
          await connection.sendRawTransaction(
            tx.serialize(),
            {
              skipPreflight: false
            }
          )
        }

        getData()
        setTimeout(() => {
          getCnfts()
          getStakedCnfts()
        }, 5000);
        setUnStakeNftList([])
        setStakeNftList([]);
        toast.success("Token Claimed Succesfully")
      }
    } catch (e: any) {
      if(e.message.includes('0x1773')){
        toast.error('You cannot claim tokens at the moment')
      }else{
        toast.error(e.message)
      }
      console.log(e)
    }

  }



  const selectStaked = () => {
    setIsStakedSelected(true)
  }

  const selectUnStaked = () => {
    setIsStakedSelected(false)
  }

  const setStakeNft = (id: any, treeId: any) => {
    setTree(treeId)
    let updatedEntries = [...stakeNftList];
    const index = updatedEntries.findIndex(entry => entry === id);

    if (index !== -1) {
      updatedEntries.splice(index, 1);
    } else {
      updatedEntries.push(id);
    }
    setStakeNftList(updatedEntries);
  };

  const setUnStakeNft = (id: any, treeId: any) => {
    setTree(treeId)

    let updatedEntries = [...unStakeNftList];
    const index = updatedEntries.findIndex(entry => entry === id);

    if (index !== -1) {
      updatedEntries.splice(index, 1);
    } else {
      updatedEntries.push(id);
    }
    setUnStakeNftList(updatedEntries);
  };

  const selectAllStakeEntries = () =>{
    let allStakeEntries : any[] = [];
    if(stakeNftList.length !== cnfts.length ){
      setStakeNftList([])
      cnfts.forEach((cft:any)=>{
        setTree(cft.compression.tree)
        allStakeEntries.push(cft.id)
      })
      setStakeNftList(allStakeEntries)
    }else{
      setStakeNftList([])
    }

  }

  const selectAllUnStakeEntries = () =>{
    let allStakeEntries : any[] = [];
    if(unStakeNftList.length !== stakedCnfts.length ){
      setUnStakeNftList([])
      stakedCnfts.forEach((cft:any)=>{
        setTree(cft?.data.compression?.tree)
        allStakeEntries.push(cft?.data?.id)
      })
      setUnStakeNftList(allStakeEntries)
    }else{
      setUnStakeNftList([])
    }
  }
  

  useEffect(() => {
    // getData()
    setTimeout(() => {
      getStakedCnfts()
    }, 3000);

  }, [stakedPoolEntries])

  useEffect(() => {
    if (fetchDone) {
      getCnfts()
      getStakedCnfts()
    }
  }, [publicKey, stakePoolData, stakedPoolEntries])


  return (
    <React.Fragment>
      <div className='stake-page'>
        <SideBar />
        <div className='stake-container'>
          <NavBar />
          <div className='m-4 row'>
            <div className="staking-texts col-lg-9 col-md-9">
              <h2 className="staking-heading">Back Your Team | Staking</h2>
              <p className="staking-para">They win, you win. Each badge staked earns $asd based on real life wins.</p>
              <p className="staking-sub-para">Gold = 50 for a win, 25 for a draw - Silver = 20 for a win, 10 for a draw - Bronze = 10 for a win, 5 for a draw.
                Badges must be staked prior to the game week to count towards $asd allocation.</p>
            </div>
            <div className="reward-box col-lg-3 col-md-3">
              <p className="reward-amount mb-0">{claimableTokens} $ASD</p>
              <button className="claim-btn" onClick={claimTokens} >CLAIM</button>
            </div>
          </div>

          <div className="stake-box">
            <div className="stake-unstake-btns">
              {isLoading ?
                <div className='progress-circle'>
                  <Spinner animation="border" variant="light" />
                </div>
                : null}
              <button className={!isStakedSelected ? "border-bottom" : ""} onClick={selectUnStaked}>Unstaked</button>
              <button className={isStakedSelected ? "border-bottom" : ""} onClick={selectStaked} >Staked</button>
            </div>
            {isStakedSelected ? <div className='my-5 mx-2'>
              <Swiper
                slidesPerView={6}
                spaceBetween={30}
                navigation={true}
                modules={[Navigation]}
                className="mySwiper"
              >
                {stakedCnfts ? stakedCnfts.map((item: any) => (
                  <SwiperSlide key={item?.data?.id} onClick={() => { setUnStakeNft(item.data.id, item.data.compression.tree) }}><StakedCard data={item} stakeSeconds={stakePoolData?.minStakeSeconds} isSelected={unStakeNftList?.includes(item.data.id)} /></SwiperSlide>
                )) : null}
              </Swiper>

            </div> : <div className='my-5 mx-2'>
              <Swiper
                slidesPerView={6}
                spaceBetween={30}
                navigation={true}
                modules={[Navigation]}
                className="mySwiper"
              >
                {cnfts ? cnfts.map((item: any) => (
                  <SwiperSlide key={item.id} onClick={() => { setStakeNft(item.id, item.compression.tree) }}><NftCard data={item} isSelected={stakeNftList?.includes(item.id)} /></SwiperSlide>
                )) : null}
              </Swiper>

            </div>}

            <div className='d-flex align-items-center justify-content-center w-100'>
              {isStakedSelected ?
                stakedCnfts && stakedCnfts.length > 0 ? 
                <div className='d-flex align-item-center gap-3'>
                  <button className="stake-btn" onClick={selectAllUnStakeEntries} >Select All</button>
                  <button className="stake-btn" onClick={unStakeNfts}>Unstake</button>                  
                </div> : null
                :
                cnfts && cnfts.length > 0 ? 
                <div className='d-flex align-item-center gap-3'>
                  <button className="stake-btn" onClick={selectAllStakeEntries}>Select All</button>
                  <button className="stake-btn" onClick={stakeNfts}>Stake</button>
                </div> : null
              }
            </div>

          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Stake