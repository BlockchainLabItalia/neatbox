import { BaseModuleDataAccess, StateStore } from "lisk-sdk";
import { codec } from "lisk-sdk";
import { counter, digitalAsset, digitalAssetHistory, registeredAssets } from "../../../schemas/digital_asset/digital_asset_types";
import { assetHistorySchema, digitalAssetCounterSchema, registeredAssetsSchema } from "../../../schemas/digital_asset/digital_asset_schemas";
import { getAssetRequests } from "./chunks";

export const CHAIN_STATE_DIGITAL_ASSETS = "digitalAsset:registeredAssets";
export const CHAIN_STATE_DIGITAL_ASSETS_COUNTER = "digitalAsset:counter";

export const setNewAsset= async (stateStore: StateStore, asset: digitalAsset) => {

    const DAs:digitalAsset[] = await getAllAssets(stateStore);

    DAs.push(asset);

    const registeredAssets: registeredAssets = {registeredAssets: DAs.sort((a, b) => a.merkleRoot.compare(b.merkleRoot))};

    await stateStore.chain.set(
        CHAIN_STATE_DIGITAL_ASSETS,
        codec.encode(registeredAssetsSchema, registeredAssets)
    );
}

export const getAmountOfDigitalAssets = async (stateStore: StateStore): Promise<number> => {

    let counterBuffer = await stateStore.chain.get(
        CHAIN_STATE_DIGITAL_ASSETS_COUNTER
    );

    if (!counterBuffer) {
        return 0;
    }

    let counter = codec.decode<counter>(
        digitalAssetCounterSchema,
        counterBuffer
    )

    return counter.counter;
}


export const getAllAssets = async (stateStore: StateStore) => {
    const registeredAssetsBuffer = await stateStore.chain.get(
        CHAIN_STATE_DIGITAL_ASSETS
    );

    if (!registeredAssetsBuffer) {
        return [];
    }

    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );

    return registeredAssets.registeredAssets;
}

export const getAssetByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer) => {
    const DAs:digitalAsset[] = await getAllAssets(stateStore);

    const DA_index: number = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (DA_index < 0) {
        throw new Error("Asset not found");
    }

    return DAs[DA_index];
}

/*
    THE FOLLOWING FUNCTIONS USE DATA ACCESS INSTEAD OF STATE STORE TO READ DATA
*/


export const _getAssetByMerkleRoot = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer): Promise<digitalAsset> => {
    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        throw new Error('No Assets Found in stateStore');
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    const DAs = registeredAssets.registeredAssets;

    const DA_index: number = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (DA_index < 0) {
        throw new Error("Asset not found");
    }

    return DAs[DA_index];
}

export const _getAllJSONAssets =async (dataAccess: BaseModuleDataAccess) => {
    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        return [];
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    
    return codec.toJSON(registeredAssetsSchema, registeredAssets);
}

export const _getAmountOfDigitalAssets = async (dataAccess: BaseModuleDataAccess): Promise<number>  => {

    let counterBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS_COUNTER
    );

    if (!counterBuffer) {
        return 0;
    }

    let counter = codec.decode<counter>(
        digitalAssetCounterSchema,
        counterBuffer
    )

    return counter.counter;
}

export const _getJSONAssetsPaged =async (dataAccess: BaseModuleDataAccess, elementsPerPage: number, page: number) => {
    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        return [];
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );

    const new_arr = registeredAssets.registeredAssets.filter(da => registeredAssets.registeredAssets.findIndex(t => t.previousAssetReference === da.merkleRoot)<0)

    const reg_ass: registeredAssets = {
        registeredAssets: new_arr.slice(elementsPerPage*(page-1), elementsPerPage*page)
    }

    return codec.toJSON(registeredAssetsSchema, reg_ass);
}

export const _getAssetHistoryByMerkleRoot = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer) => {

    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        return [];
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    const DAs = registeredAssets.registeredAssets;

    let history: digitalAssetHistory = await retrieveHistory(dataAccess, DAs, merkleRoot);

    if(!history) {
        const index = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

        if (index < 0) {
            throw new Error("Asset not found");
        }
        history = {
            merkleRoot: merkleRoot,
            owner: DAs[index].owner,
            requests: []
        }
    };

    console.log(history)
    return codec.toJSON(assetHistorySchema, history);
}

const retrieveHistory = async (dataAccess: BaseModuleDataAccess, assets: digitalAsset[], merkleRoot: Buffer): Promise<digitalAssetHistory> => {
    
    // if (merkleRoot.equals(Buffer.alloc(0))) {
    //     return null;
    // }

    const index = assets.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (index < 0) {
        throw new Error("Asset not found");
    }

    const asset = assets[index];
    if (asset.previousAssetReference.equals(Buffer.alloc(0))) {
        return {
            merkleRoot: merkleRoot,
            owner: asset.owner,
            requests: await getAssetRequests(dataAccess, merkleRoot)
        };
    }
    return {
        merkleRoot: merkleRoot,
        owner: asset.owner,
        requests: await getAssetRequests(dataAccess, merkleRoot),
        previousVersion: await retrieveHistory(dataAccess, assets, asset.previousAssetReference)
    }
}