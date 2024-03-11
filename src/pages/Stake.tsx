import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar/NavBar'
import SideBar from "../components/Sidebar/Index"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import NftCard from "../components/Nftcard/Index"
import StakedCard from "../components/stakedCard/Index"
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { PublicKey, Transaction } from '@solana/web3.js';
import { stakeCnft, unStakeCnft, teams, getProvider, findStakeEntryId, claimCnftsTokens } from '../types/staking-func';
import * as anchor from "@project-serum/anchor"
import { connection } from '../types/environment';
import useStakePoolData from '../hooks/useStakePoolData';
import useStakePoolEntries from '../hooks/stakePoolEntries';
import { Spinner, Row, Col } from 'react-bootstrap';
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
  const [stakeLoading, setStakeLoading] = useState<boolean>(false)
  const [unstakeLoading, setUnstakeLoading] = useState<boolean>(false)
  umi.use(dasApi())

  const getCnfts = async () => {
 
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

  }
  const getStakedCnfts = async () => {
    try {
      if (!publicKey) return
      if (!wallet) return
      if (!stakedPoolEntries) return
      setIsLoading(true)

      let allstakedCnfts: any[] = []

      let amountToTransfer = 0
        for(let entry of stakedPoolEntries){
        //@ts-ignore
        const asset = await umi.rpc.getAsset(entry?.account?.stakeMint)
        //@ts-ignore
        allstakedCnfts.push({data : asset,chainData : entry?.account})
        let filteredAttr :any;
        let filteredTeam : any;
        if(asset?.content?.metadata?.attributes && asset?.content?.metadata?.attributes.length > 0){
          filteredAttr = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Rarity')[0];
          filteredTeam = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Team')[0];
        }else{
          await axios.get(asset?.content?.json_uri).then((resp)=>{
          filteredAttr = resp?.data?.attributes?.filter((item:any)=> item?.trait_type === 'Rarity')[0];
          filteredTeam = resp?.data?.attributes?.filter((item:any)=> item?.trait_type === 'Team')[0];
          })
        }

      //@ts-ignore
      let filteredTeamId = teams.filter((team:any)=>team.name===filteredTeam.value)[0];
        //@ts-ignore
      const date = new Date(entry?.account?.lastStakedAt.toNumber() * 1000);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with zero
      const day = String(date.getDate()).padStart(2, '0');

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1 and pad with zero
      const currentDay = String(currentDate.getDate()).padStart(2, '0');

      const startDate = `${year}-${month}-${day}`;
      const endDate = `${currentYear}-${currentMonth}-${currentDay}`;

                const response = await axios.get(`https://script.googleusercontent.com/macros/echo?user_content_key=HuCJj36nmZZwS0rhx5Cu-zZJIyVQzXQgLuojvRp32DqrbNI22tDiwfKfttMtZB-NbzXz6v6tWWEfuhuD5eE8QfI2Txbe0Vv9OJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHa03NbMS9aSRNUPwK0Np3BqRXLhRFk7AldsS11GBEDP0-B9YMIoI6rbQ16o68jY_zLaMCeyk36k5J_b14cYIOPOcFhO7tjhWMt83BI-dLAEELnRA9CKwOBnXMVAqI2ezS_w&lib=Mg0dS74DM6YtoXsJGIFHvs7ee_uHNINZP`);
                const matchesData = response.data;

                if (matchesData.length > 0) {
                    for (let match of matchesData) {
                        if (match.Result === "Draw") {
                            if (filteredAttr?.value === 'Gold') {
                                amountToTransfer += goldWinAmount / 2;
                            } else if (filteredAttr?.value === 'Silver') {
                                amountToTransfer += silverWinAmount / 2;
                            } else if (filteredAttr?.value === 'Bronze') {
                                amountToTransfer += bronzeWinAmount / 2;
                            }
                        } else if (match.Result === "Win" && match["Team Name"] === filteredTeamId) {
                            if (filteredAttr?.value === 'Gold') {
                                amountToTransfer += goldWinAmount;
                            } else if (filteredAttr?.value === 'Silver') {
                                amountToTransfer += silverWinAmount;
                            } else if (filteredAttr?.value === 'Bronze') {
                                amountToTransfer += bronzeWinAmount;
                            }
                        } else if (match.Result === "Loss" && match["Team Name"] === filteredTeamId) {
                            // You can handle loss scenarios here if needed
                        }
                    }
                }
            }
        }

        setClaimableTokens(amountToTransfer);
        setstakedCnfts(allstakedCnfts);
        setFetchDone(false);
        setIsLoading(false);
    } catch (error) {
        console.log(error);
        setFetchDone(false);
        setIsLoading(false);
    }
}




  const stakeNfts = async () => {
    try {
      setStakeLoading(true)
      if (publicKey && wallet) {
        if (!wallet) {
        setStakeLoading(false)
          return
        }

        if (stakeNftList.length <= 0) {
          toast.error("Please Select Nfts To Stake !")
        setStakeLoading(false)
          return
        }

        if (!stakePoolData) return

        const allTx: Transaction[] = [];

        for (let entry of stakeNftList) {
          const tx: Transaction | undefined = await stakeCnft(wallet, entry, stakePoolData.poolId)
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
        setStakeLoading(false)
        toast.success("Staked Succesfully")
      }
    } catch (e: any) {
      setStakeLoading(false)
      toast.error(e.message)
      console.log(e)
    }

  }

  const unStakeNfts = async () => {
    try {
      setUnstakeLoading(true)
      if (publicKey && wallet) {
        if (!wallet) {
      setUnstakeLoading(false)
          return
        }

        if (unStakeNftList.length <= 0) {
          toast.error("Please Select Nfts To UnStake !")
      setUnstakeLoading(false)
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
      setUnstakeLoading(false)
        toast.success("Unstaked Succesfully")
      }
    } catch (e: any) {
      setUnstakeLoading(false)
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

  const setStakeNft = (cnft: any) => {
    // setTree(treeId)
    let updatedEntries = [...stakeNftList];
    const index = updatedEntries.findIndex(entry => entry.id === cnft.id);

    if (index !== -1) {
      updatedEntries.splice(index, 1);
    } else {
      updatedEntries.push(cnft);
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
    if(stakeNftList.length !== cnfts.length ){
      setStakeNftList([])
      setStakeNftList(cnfts)
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
          <div className='m-lg-4 m-mb-3 m-sm-1 m-1 row align-items-center'>
            <div className="staking-texts col-xl-9 col-lg-12 col-md-12 col-sm-12 col-12">
              <h2 className="staking-heading">Back Your Team | Staking</h2>
              <p className="staking-para">They win, you win. Each badge staked earns $asd based on real life wins.</p>
              <p className="staking-sub-para">Gold = 50 for a win, 25 for a draw - Silver = 20 for a win, 10 for a draw - Bronze = 10 for a win, 5 for a draw.
                Badges must be staked prior to the game week to count towards $asd allocation.</p>
            </div>
            <div className="reward-box col-xl-3 col-lg-12 col-md-12 col-sm-12 col-12">
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
            {isStakedSelected ? <div className='my-lg-5 my-mb-3 my-sm-2 my-2 mx-2 staking-cards-container'>
            <Row className='w-100 m-auto'>
            {stakedCnfts ? stakedCnfts.map((item: any) => (
                <Col xl={2} lg={3} md={4} sm={6} xs={6} key={item?.data?.id} onClick={() => { setUnStakeNft(item.data.id, item.data.compression.tree) }} className='mb-3' >
                  <StakedCard data={item} stakeSeconds={stakePoolData?.minStakeSeconds} isSelected={unStakeNftList?.includes(item.data.id)} />
                </Col>
                )) : null}
            </Row>
            </div> : <div className='my-lg-3 my-mb-2 my-sm-2 my-2 mx-2 staking-cards-container'>
            <Row className='w-100 m-auto'>
            {cnfts ? cnfts.map((item: any) => (
                <Col xl={2} lg={3} md={4} sm={6} xs={6} key={item.id} onClick={() => { setStakeNft(item) }} className='mb-3' >
                  <NftCard data={item} isSelected={!!stakeNftList?.some(stakedNft => stakedNft.id === item.id)} />
                </Col>
                )) : null}
            </Row>
            </div>}

            <div className='d-flex align-items-center justify-content-center position-sticky staking-btns-container'>
              {isStakedSelected ?
                stakedCnfts && stakedCnfts.length > 0 ? 
                <div className='d-flex align-item-center gap-3'>
                  <button className="select-btn" onClick={selectAllUnStakeEntries} >Select All</button>
                  <button className="stake-btn btn-loader" onClick={unStakeNfts} disabled={unstakeLoading} >Unstake { unstakeLoading ? <div className='stake-loading'><Spinner animation="border" variant="light" /></div>: null} </button>                  
                </div> : null
                :
                cnfts && cnfts.length > 0 ? 
                <div className='d-flex align-item-center gap-3'>
                  <button className="select-btn" onClick={selectAllStakeEntries}>Select All</button>
                  <button className="stake-btn btn-loader" onClick={stakeNfts} disabled={stakeLoading} >Stake {stakeLoading ? <div className='stake-loading'><Spinner animation="border" variant="light" /></div>: null} </button>
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