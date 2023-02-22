import UniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { AbiInput, AbiItem, Eth } from "@crypto-jambot/web3-utils";

export function getData(eth: Eth, data: string, topics: string[]) {
    const eventHash = topics[0];
    const eventTypes = resolveEventTypes(eth, eventHash);
    const decodedData = eth.abi.decodeLog(
        eventTypes as AbiInput[],
        data,
        topics.slice(1)
    );
    //Flipping value to opposite for searching mongodb for affected paths
    const ordered = !getOrdered(eth, eventHash, decodedData);
    return { ordered, timestamp: Date.now() };
}

function getOrdered(eth: Eth, eventHash: string, data: Record<string, any>) {
    if (eventHash === getV2SwapHash(eth)) {
        return data.amount0In > 0;
    }
    return data.amount0 > 0;
}

export function getV2SwapHash(eth: Eth) {
    return eth.abi.encodeEventSignature(UniswapV2Pair.abi[3] as AbiItem);
}
export function getV3SwapHash(eth: Eth) {
    return eth.abi.encodeEventSignature(UniswapV3Pool.abi[9] as AbiItem);
}
export function resolveEventTypes(eth: Eth, eventHash: string) {
    switch (eventHash) {
        case getV2SwapHash(eth):
            return UniswapV2Pair.abi[3].inputs;
        case getV3SwapHash(eth):
            return UniswapV3Pool.abi[9].inputs;
    }
}
