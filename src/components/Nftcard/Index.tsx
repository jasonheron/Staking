import React, { useEffect, useState } from 'react'
import nft from "../../assets/images/nft.png"
import "./style.css"
import axios from 'axios'

const Index = ({data, isSelected} : any) => {

    const [nftData, setNftData] = useState<any>()
    const [rarityData, setRarityData] = useState<any>()
    const [teamName, setTeamName] = useState<any>()
    // console.log(data)

    const getNftData = async () =>{
        try{
            axios.get(data.content.json_uri).then(res=>{
                setNftData(res.data)
            })
        }catch(e){
            console.log(e)
        }
    }

    // console.log("nftData",nftData)

    useEffect(() => {
      if(data){
        getNftData()
      }
    }, [data])

    useEffect(() => {
        if(nftData){
          let filteredAttr = nftData.attributes.filter((item:any)=> item.trait_type === 'Rarity')
          let filteredTeam = nftData.attributes.filter((item:any)=> item.trait_type === 'Team')
          setRarityData(filteredAttr)
          setTeamName(filteredTeam)
        }
      }, [nftData])
    
    // console.log("nftData",data)



  return (
    <div className='nft-card-container'>
        {isSelected ? <div className="selected-dot"></div> : null} 
        <img src={nftData?.image} alt="nft" className='w-100' />
        <div className='nft-details-container'>
            <p className='nft-name'>{nftData?.name}</p>
            <p className='nft-collection'>
            {teamName ? teamName.map((e:any)=>
                    <span className='text-2' key={e}>{e.value}</span>
                    ) : null}
            </p>
            <div className='d-flex align-items-center justify-content-between'>
                <div className='nft-details'>
                    <p className='text-1'>Rarity</p>
                    {rarityData ? rarityData.map((e:any)=>{
                        return <span className='text-2' key={e}>{e.value}</span>
                    }) : null}
                </div>
                <div className='nft-details text-end'>
                    <p className='text-1'>$asd for win</p>
                    {rarityData ? rarityData.map((e:any)=>{
                        return <span className='text-2' key={e}>{e.value === 'Gold' ?50 : e.value === 'Silver' ? 20 : 10 }</span>
                    }) : null}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Index