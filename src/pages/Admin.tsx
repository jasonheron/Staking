import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react'
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react"
import { initStakePool, updateStakePool } from '../types/staking-func'
import { connection } from '../types/environment'
import { PublicKey, Transaction, sendAndConfirmRawTransaction } from '@solana/web3.js'
import useStakePoolData from '../hooks/useStakePoolData';
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';



// const umi = createUmi("https://mainnet.helius-rpc.com/?api-key=c94aaeb1-2ddf-45d6-a38d-383b3e6d1a64");
const umi = createUmi(connection.rpcEndpoint);




const Admin = () => {

  const { publicKey, signTransaction } = useWallet()
  const wallet = useAnchorWallet()
  const [creatorAddress, setcreatorAddress] = useState<string>("")
  const [minStakeSeconds, setMinStakeSeconds] = useState<number>(0)
  const [rewardToken, setrewardToken] = useState<string>("")
  const [tokenAmount, setTokenAmount] = useState<number>(0)
  const [tokenAddress, setTokenAddress] = useState<string>("")
  const [tokensWalletAmount, setTokensWalletAmount] = useState<number>(0)
  const { stakePoolData } = useStakePoolData()
  umi.use(dasApi())


  const initializePool = async () => {
    try {
      if (publicKey && wallet) {
        const tx: Transaction | undefined = await initStakePool(wallet, minStakeSeconds, new PublicKey(creatorAddress), new PublicKey(rewardToken), tokenAmount)
        if (!tx) {
          return
        }
        tx.feePayer = publicKey
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        // tx.setSigners(token)
        if (!tx || !signTransaction) {
          return
        }


        console.log(tx)
        const signedTx = await signTransaction(tx)

        const txId = await sendAndConfirmRawTransaction(connection, signedTx.serialize())

        console.log('signature', txId)
      }
    } catch (e) { console.log(e) }
  }

  const updatePool = async () => {
    if (publicKey && wallet) {
      const tx: Transaction | undefined = await updateStakePool(wallet, minStakeSeconds, stakePoolData.poolId)
      if (!tx) {
        return
      }
      tx.feePayer = publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      // tx.setSigners(token)
      if (!tx || !signTransaction) {
        return
      }


      console.log(tx)
      const signedTx = await signTransaction(tx)

      const txId = await sendAndConfirmRawTransaction(connection, signedTx.serialize())

      console.log('signature', txId)
    }
  }

  useEffect(() => {
    const getData = async () => {
      try {
        if (stakePoolData) {
          const ata = await getAssociatedTokenAddress(new PublicKey("AnEbhE8xmiRpT621RF6PtRQPUCT67QyRLhbizKFiZVv4"), stakePoolData.poolId, true);
          let tokenData = await getAccount(connection,ata);
          console.log(ata.toString(), tokenData)
          setTokenAddress(ata.toString());
          setTokensWalletAmount(Number(tokenData?.amount))

        }
      } catch (e) {
        console.log(e)
      }
    }
    getData()
  }, [stakePoolData])

  // console.log("stake pool", stakePoolData?.authority?.toString(),minStakeSeconds)



  return (
    <Form>
      <p className='text-white'>Stake Pool Id : {stakePoolData?.poolId?.toString()}</p>
      <p className='text-white mb-0 inline-block'>Token Account : {tokenAddress ? tokenAddress : null}</p>
      <p className='text-white mb-2 inline'>Amount : {tokensWalletAmount ? tokensWalletAmount/100 : null}</p>
      <Form.Group className="mb-3 text-white" controlId="formBasicEmail">
        <Form.Label>Creator Address</Form.Label>
        <Form.Control type="text" placeholder="Creator Address" onChange={(e) => { setcreatorAddress(e.target.value) }} />
      </Form.Group>

      <Form.Group className="mb-3 text-white" controlId=" ">
        <Form.Label>Min Stake Seconds</Form.Label>
        <Form.Control type="number" placeholder="Min Stake Seconds" onChange={(e) => { setMinStakeSeconds(Number(e.target.value)) }} />
      </Form.Group>

      <Form.Group className="mb-3 text-white" controlId=" ">
        <Form.Label>Reward Token</Form.Label>
        <Form.Control type="text" placeholder="Reward Token" onChange={(e) => { setrewardToken(e.target.value) }} />
      </Form.Group>

      <Form.Group className="mb-3 text-white" controlId=" ">
        <Form.Label>Token Amount</Form.Label>
        <Form.Control type="number" placeholder="Token Amount" onChange={(e) => { setTokenAmount(Number(e.target.value)) }} />
      </Form.Group>

      <Button variant="primary" onClick={initializePool}>
        Create Pool
      </Button>
      <Button variant="primary" onClick={updatePool}>
        update
      </Button>
    </Form>
  )
}

export default Admin