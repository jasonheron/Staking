import { AccountMeta, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as anchor from '@project-serum/anchor'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID , TokenOwnerOffCurveError, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import idl from '../types/idl.json'
import { connection } from "./environment"
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import axios from "axios";

export const BUBBLEGUM_PROGRAM_ID = new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY");

export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",);

export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK");

export const SPL_NOOP_PROGRAM_ID = new PublicKey("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV");

const goldWinAmount = 50;
const silverWinAmount = 20;
const bronzeWinAmount = 10;
// Change later when new season starts
const season = 2023;

export const getProvider = (wallet: AnchorWallet) => {
  const provider = new anchor.AnchorProvider(
    connection, wallet, { "preflightCommitment": "processed" },
  );
  return provider;
}

export const initStakePool = async (wallet: AnchorWallet, 
  minStakeSeconds: number, 
  creatorAddress: PublicKey,
  rewardToken : PublicKey,
  tokenAmount : number) => {
  try {
    const provider = getProvider(wallet)
    const stakePoolIdentifier: string = `premier-league`;
    const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);
    const stake_pool = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("stake-pool"),
      anchor.utils.bytes.utf8.encode(stakePoolIdentifier)
      ],
      program.programId
    )[0]

    const poolTokenAccount = await getAssociatedTokenAddress(rewardToken,stake_pool,true);
    const walletTokenAccount = await getAssociatedTokenAddress(rewardToken,wallet.publicKey);

    let transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        poolTokenAccount, // ata
        stake_pool, // owner
        rewardToken // mint
      )
    );

    transaction.add(
      createTransferCheckedInstruction(
        walletTokenAccount,
        rewardToken, 
        poolTokenAccount, 
        wallet.publicKey,
        tokenAmount * 100, 
        2 
      )
    );

    console.log("stake_pool",stake_pool.toString())

    const poolTx: TransactionInstruction = await program.methods.initPool(
      {
        identifier: stakePoolIdentifier,
        minStakeSeconds: new anchor.BN(minStakeSeconds),
        allowedCreators: creatorAddress,
        rewardToken: rewardToken
      }
    ).accounts({
      stakePool: stake_pool,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }).instruction()

    transaction.add(poolTx)


    return transaction;
  } catch (e) {
    console.log(e)
  }
}

export const updateStakePool = async (wallet: AnchorWallet, minStakeSeconds: number, poolId: PublicKey) => {
  try {
    const provider = getProvider(wallet)
    const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

    const poolTx: TransactionInstruction = await program.methods.updatePool(
      {
        minStakeSeconds: new anchor.BN(minStakeSeconds)
      }
    ).accounts({
      stakePool: poolId,
      payer: wallet.publicKey,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }).instruction()

    const transaction = new Transaction().add(poolTx)

    return transaction;
  } catch (e) {
    console.log(e)
  }
}

export const initStakePoolEntry = async (wallet: AnchorWallet, token: PublicKey, poolId: PublicKey, stakeEntryId: PublicKey) => {

  const provider = getProvider(wallet)
  const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

  const txn: TransactionInstruction = await program.methods.initStakeEntry().accounts({
    stakeEntry: stakeEntryId,
    stakePool: poolId,
    stakeMint: token,
    payer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  }).instruction();

  return txn

}

export const stakeCnft = async (wallet: AnchorWallet, nftAddress: PublicKey, poolId : PublicKey, treeId : String) => {
  try {
    const provider = getProvider(wallet)
    const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

    const tx: Transaction = new Transaction();



    const assetId = nftAddress.toString();
    const asset = await getAsset(assetId);
    // console.log(res)
  
    const proof = await getAssetProof(assetId);
    const proofPathAsAccounts = mapProof(proof);
  
    const root = decode(proof.root);
    const dataHash = decode(asset.compression.data_hash);
    const creatorHash = decode(asset.compression.creator_hash);
    const nonce = new anchor.BN(asset.compression.leaf_id);
    const index = asset.compression.leaf_id;


    const stakeEntry = findStakeEntryId(poolId, nftAddress)

    const stakeEntryId = await connection.getAccountInfo(stakeEntry)
    if (stakeEntryId === null) {
      const txn = await initStakePoolEntry(wallet, nftAddress, poolId, stakeEntry)
      tx.add(txn)
    }

    const tree = new anchor.web3.PublicKey(
      treeId
    );
  
    const [treeAuthority, _bump2] = anchor.web3.PublicKey.findProgramAddressSync(
      [tree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
    );




    const txn = await program.methods.stakeCnft(root, dataHash, creatorHash, nonce, index).accounts({
      stakePool: poolId,
      stakeEntry: stakeEntry,
      stakeMint: nftAddress,
      leafOwner: wallet.publicKey,
      leafDelegate: wallet.publicKey,
      treeAuthority: treeAuthority,
      merkleTree: tree,
      newLeafOwner: stakeEntry,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).remainingAccounts(proofPathAsAccounts).instruction()

    tx.add(txn)

    return tx



  } catch (e) {
    console.log(e)
  }
}

export const unStakeCnft = async (wallet: AnchorWallet, nftAddress: PublicKey, poolId : PublicKey,treeId : String) => {
  try {
    const provider = getProvider(wallet)
    const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);

    const tx: Transaction = new Transaction();
    const assetId = nftAddress.toString();
    const asset = await getAsset(assetId);
    
    
    const proof = await getAssetProof(assetId);
    const proofPathAsAccounts = mapProof(proof);
    
    const root = decode(proof.root);
    const dataHash = decode(asset.compression.data_hash);
    const creatorHash = decode(asset.compression.creator_hash);
    const nonce = new anchor.BN(asset.compression.leaf_id);
    const index = asset.compression.leaf_id;
    
    
    const stakeEntry = findStakeEntryId(poolId, nftAddress)
    
    const tree = new anchor.web3.PublicKey(treeId);
    
    const [treeAuthority, _bump2] = anchor.web3.PublicKey.findProgramAddressSync(
      [tree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
      );
      
      


    const txn = await program.methods.unstakeCnft(root, dataHash, creatorHash, nonce, index).accounts({
      stakePool: poolId,
      stakeEntry: stakeEntry,
      stakeMint: nftAddress,
      payer : wallet.publicKey,
      treeAuthority: treeAuthority,
      merkleTree: tree,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).remainingAccounts(proofPathAsAccounts).instruction()

    tx.add(txn)

    return tx



  } catch (e) {
    console.log(e)
  }
}

export const claimCnftsTokens = async (wallet: AnchorWallet, nftAddress: PublicKey, poolId : PublicKey) => {
  try {
    const provider = getProvider(wallet)
    const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);
    
    const tx: Transaction = new Transaction();
    let amountToTransfer : number = 0;

    const assetId = nftAddress.toString();
    const asset = await getAsset(assetId);
    
    
    const proof = await getAssetProof(assetId);
    const proofPathAsAccounts = mapProof(proof);
    
    
    const stakeEntry = findStakeEntryId(poolId, nftAddress)
    
      const rewardToken = new PublicKey("AnEbhE8xmiRpT621RF6PtRQPUCT67QyRLhbizKFiZVv4");
      
      const poolTokenAccount = await getAssociatedTokenAddress(rewardToken,poolId,true);
      const walletTokenAccount = await getAssociatedTokenAddress(rewardToken,wallet.publicKey);
      const nftData: any = await program.account.stakeEntry.fetch(stakeEntry.toString())
      
      // console.log("nft chain data : ",nftData, nftData.lastStakedAt.toNumber())
      
      let tokenAccount = await connection.getAccountInfo(walletTokenAccount)
      
      // console.log("asser",asset)
      let filteredAttr = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Rarity')[0];
      let filteredTeam = asset?.content?.metadata?.attributes?.filter((item:any)=> item?.trait_type === 'Team')[0];

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

      const demoStartDate = '2023-12-01';
      const demoEndDate = '2023-12-30'

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

    if(!tokenAccount){
      tx.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          poolTokenAccount, // ata
          poolId, // owner
          rewardToken // mint
          )
      );
    }

    const txn = await program.methods.claimToken(new anchor.BN(1*100)).accounts({
      stakePool: poolId,
      stakeEntry: stakeEntry,
      poolTokenAccount : poolTokenAccount,
      userTokenAccount : walletTokenAccount,
      payer : wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }).instruction()


    console.log(tx)

    tx.add(txn)

    return tx



  } catch (e) {
    console.log(e)
  }
}


export const STAKE_ENTRY_SEED = "stake-entry";
export const findStakeEntryId = (
  stakePoolId: PublicKey,
  mintId: PublicKey,
): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(STAKE_ENTRY_SEED),
      stakePoolId.toBuffer(),
      mintId.toBuffer()
    ],
    new PublicKey(idl.metadata.address),
  )[0];
};

export const findMintMetadataId = (mintId: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mintId.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  )[0];
};

export function findTokenRecordId(
  mint: PublicKey,
  token: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("token_record"),
      token.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  )[0];
}

export function getAssociatedTokenAddressSync(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): PublicKey {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new TokenOwnerOffCurveError();

  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId
  );

  return address;
}

export const getStakeEntry = async (entryId: PublicKey, wallet : AnchorWallet) => {
  const provider = getProvider(wallet)
  const program = new anchor.Program(idl as anchor.Idl, idl.metadata.address, provider);
  const stakeEntry = await program.account.stakeEntry.fetch(entryId);

  return stakeEntry
}




export function decode(stuff: string) {
  return bufferToArray(bs58.decode(stuff))
}
function bufferToArray(buffer: Buffer): number[] {
  const nums: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    nums.push(buffer[i]);
  }
  return nums;
}
export const mapProof = (assetProof: { proof: string[] }): AccountMeta[] => {
  if (!assetProof.proof || assetProof.proof.length === 0) {
    throw new Error("Proof is empty");
  }
  return assetProof.proof.map((node) => ({
    pubkey: new PublicKey(node),
    isSigner: false,
    isWritable: false,
  }));
};

// const RPC_PATH = "https://devnet.helius-rpc.com/?api-key=fb8d7b85-2e9c-4121-9018-c1f9a13fedcd";
const RPC_PATH = connection.rpcEndpoint;


export async function getAsset(assetId: any, rpcUrl = RPC_PATH): Promise<any> {
  try {
    const axiosInstance = axios.create({
      baseURL: rpcUrl,
    });
    const response = await axiosInstance.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "getAsset",
      id: "rpd-op-123",
      params: {
        id: assetId
      },
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
  }
}

export async function getAssetProof(assetId: any, rpcUrl = RPC_PATH): Promise<any> {
  try {

    const axiosInstance = axios.create({
      baseURL: rpcUrl,
    });
    const response = await axiosInstance.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "getAssetProof",
      id: "rpd-op-123",
      params: {
        id: assetId
      },
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
  }
}

export const teams = [
  {id: 40, name: 'Liverpool'},
  {id: 47, name: 'Tottenham'}, 
  {id: 34, name: 'Newcastle'}, 
  {id: 50, name: 'Manchester C'}, 
  {id: 42, name: 'Arsenal'}, 
  {id: 1359, name: 'Luton'}, 
  {id: 33, name: 'Manchester U'}, 
  {id: 48, name: 'West Ham'}, 
  {id: 51, name: 'Brighton'}, 
  {id: 49, name: 'Chelsea'}, 
  {id: 36, name: 'Fullham'}, 
  {id: 62, name: 'Sheffield'},
  {id: 66, name: 'Aston Villa'}, 
  {id: 44, name: 'Burnley'}, 
  {id: 35, name: 'Bournemouth'}, 
  {id: 55, name: 'Brentford'}, 
  {id: 52, name: 'Crystal Palace 2'}, 
  {id: 65, name: 'Nottingham'}, 
  {id: 39, name: 'Wolves'}, 
  {id: 45, name: 'Everton'}, 
  ]