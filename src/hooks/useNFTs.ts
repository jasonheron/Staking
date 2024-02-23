import { useState, useEffect } from 'react';
import axios from 'axios';

const useNFTs = (publicKey) => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!publicKey) return;
      setIsLoading(true);
      // Replace with your actual API call
      const response = await axios.get(`API_ENDPOINT?publicKey=${publicKey}`);
      setNfts(response.data);
      setIsLoading(false);
    };

    fetchNFTs();
  }, [publicKey]);

  return { nfts, isLoading };
};

export default useNFTs
