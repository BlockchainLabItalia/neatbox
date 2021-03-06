import {  BaseModuleDataAccess, cryptography, StateStore } from "lisk-sdk";
import { codec } from "lisk-sdk";
import { registeredChunksSchema } from "../../../schemas/chunks/chunk_schemas";
import { chunk, registered_chunks, request_object } from "../../../schemas/chunks/chunk_types";
import { request } from "../../../schemas/digital_asset/digital_asset_types";

export const CHAIN_STATE_CHUNKS = "digitalAsset:registeredChunks";

export const setNewChunk= async (stateStore: StateStore, asset: chunk) => {

    const chunks:chunk[] = await getAllChunks(stateStore);

    chunks.push(asset);

    const registeredChunks: registered_chunks = {chunks: chunks.sort((a, b) => a.merkleRoot.compare(b.merkleRoot))};

    await stateStore.chain.set(
        CHAIN_STATE_CHUNKS,
        codec.encode(registeredChunksSchema, registeredChunks)
    );
}

export const updateChunk =async (stateStore:StateStore, asset:chunk) => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot));
    
    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    chunks[c_index] = asset;

    const registeredChunks: registered_chunks = {chunks: chunks}

    await stateStore.chain.set(
        CHAIN_STATE_CHUNKS,
        codec.encode(registeredChunksSchema, registeredChunks)
    );
}

export const getChunkByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer) => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    return chunks[c_index];    
}

export const checkChunkExistenceByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer): Promise<boolean> => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        return false;
    }

    return true;    
}

export const getAllChunks = async (stateStore: StateStore) => {
    const registeredChunksBuffer = await stateStore.chain.get(
        CHAIN_STATE_CHUNKS
    );

    if (!registeredChunksBuffer) {
        return [];
    }

    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );

    return registeredChunks.chunks;
}

export const _getChunkByMerkleRoot = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer) => {
    const registeredChunksBuffer = await dataAccess.getChainState(
        CHAIN_STATE_CHUNKS
    );
    
    if (!registeredChunksBuffer) {
        return [];
    }
    
    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );

    const c_index: number = registeredChunks.chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    return registeredChunks.chunks[c_index];    
}

export const _getAllJSONChunks =async (dataAccess: BaseModuleDataAccess) => {
    const registeredChunksBuffer = await dataAccess.getChainState(
        CHAIN_STATE_CHUNKS
    );
    
    if (!registeredChunksBuffer) {
        return [];
    }
    
    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );
    
      return codec.toJSON(registeredChunksSchema, registeredChunks);
}

export const getAssetRequests = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer): Promise<request[]> => {
    const registeredChunksBuffer = await dataAccess.getChainState(
        CHAIN_STATE_CHUNKS
    );
    
    if (!registeredChunksBuffer) {
        return [];
    }

    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );

    const c_index: number = registeredChunks.chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    const requestedBy: request_object[] = registeredChunks.chunks[c_index].requestedBy;
    let requests: request[] = [];

    requestedBy.forEach((req) => {
        requests.push({
            address: cryptography.getBase32AddressFromAddress(req.address),
            mode: req.requestType,
            status: req.status
        })
    })

    return requests;
}

