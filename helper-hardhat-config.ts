export interface networkConfigItem {
    name: string;
    ethUsdPriceFeedAddress?: string;
    blockConfirmations?: number;
}
export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}
export const networkConfig: networkConfigInfo = {
    5: {
        name: "goerli",
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 1,
    },
    137: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0x67935f65D1577ced9f4929D3679A157E95C1c02c",
    },
};
export const developmentChains = ["hardhat", "localhost"];
export const DECIMALS = 18;
export const INITIAL_ANSWER = "2000000000000000000000"; //2000
