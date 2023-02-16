// This file provides methods to get market data for a given pair on uniswap v2.
// We connect to an ethereum node using web3.js and call the uniswap v2 query smart contract. It has getPairsByIndexRange() getReservesByPairs()

// Importing the required modules
const WebSocket = require('ws'); // Websocket client
const Web3 = require('web3'); // Ethereum node client
const { queryV2ABI } = require('./data/BatchQueryV2.json'); // Uniswap v2 query smart contract ABI

const queryV2 = process.env.UNISWAP_V2_QUERY_CONTRACT; // Uniswap v2 query smart contract address
const factoryV2 = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Uniswap v2 factory smart contract address
const web3 = new Web3(process.env.ETHEREUM_NODE); // Ethereum node

// This function returns the list of all pairs on V2 by calling getPairsByIndexRange() on the query smart contract
async function getPairs(){
    try{
        // First we get the total number of pairs by calling the factory contract
        let totalPairs = await new web3.eth.Contract(require('./UniswapV2Factory.json').abi, factoryV2).methods.allPairsLength().call();
        // Then we call the query smart contract to get the list of all pairs. We do this in batches of 1000 pairs
        let pairs = [];
        for(let i = 0; i < totalPairs; i += 1000){
            // Get the list of pairs for the current batch
            let batchPairs = await new web3.eth.Contract(queryV2ABI, queryV2).methods.getPairsByIndexRange(i, Math.min(i + 1000, totalPairs)).call();
            // Add the pairs to the list of all pairs
            pairs = pairs.concat(batchPairs);
        }
        // Return the list of all pairs
        return pairs.map((pair) => ({base:pair.token0, quote:pair.token1}));
    } catch (error) {
        console.log(`Uniswap V2 getPairs() error: ${error}`);
    }
}

// The following function returns the pri