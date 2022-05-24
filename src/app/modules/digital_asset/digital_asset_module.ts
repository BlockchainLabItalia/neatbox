/*
 * LiskHQ/lisk-commander
 * Copyright © 2021 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

/* eslint-disable class-methods-use-this */

import {
    AfterBlockApplyContext,


    AfterGenesisBlockApplyContext, BaseModule,


    BeforeBlockApplyContext, codec, TransactionApplyContext
} from 'lisk-sdk';
import { BitagoraAccountProps, digitalAssetAccountSchema } from '../../schemas/account';
import { chunkSchema } from '../../schemas/chunks/chunk_schemas';
import { digitalAssetCounterSchema, digitalAssetSchema } from '../../schemas/digital_asset/digital_asset_schemas';
import { counter, digitalAsset } from '../../schemas/digital_asset/digital_asset_types';
import { ClaimAsset } from "./assets/claim_asset";
import { CreateAsset } from "./assets/create_asset";
import { RequestAsset } from "./assets/request_asset";
import { ResponseAsset } from "./assets/response_asset";
import { CHAIN_STATE_DIGITAL_ASSETS_COUNTER, setNewAsset, _getAllJSONAssets, _getAmountOfDigitalAssets, _getAssetByMerkleRoot, _getAssetHistoryByMerkleRoot, _getJSONAssetsPaged } from './utils/assets';
import { setNewChunk, _getAllJSONChunks, _getChunkByMerkleRoot } from './utils/chunks';

export class DigitalAssetModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getAllAssets: async () => _getAllJSONAssets(this._dataAccess),
        getAllAssetsPaged: async (params: Record<string, unknown>) => {
            let { elements, page } = params;
            if (typeof page === 'string' ) {
                page = Number(page)
            } 
            if (typeof elements === 'string' ) {
                elements = Number(elements)
            } 
            return _getJSONAssetsPaged(this._dataAccess, elements as number, page as number);
        },
        getAllChunks: async () => _getAllJSONChunks(this._dataAccess),
        getAmountOfDigitalAssets: async (): Promise<number> => _getAmountOfDigitalAssets(this._dataAccess),
        getAssetHistory:async (params: Record<string, unknown>) => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            return _getAssetHistoryByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
        },

        getAsset:async (params:Record<string, unknown>): Promise<object> => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            const asset = await _getAssetByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
            //return JSON.stringify(asset);
            return codec.toJSON(digitalAssetSchema, asset)
        },
        
        getAssetDetail:async (params:Record<string, unknown>): Promise<object> => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            const asset = await _getChunkByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
            //return JSON.stringify(asset);
            return codec.toJSON(chunkSchema, asset)
        },

        getAssetOwner: async(params: Record<string, unknown>): Promise<string> => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            const asset:digitalAsset = await _getAssetByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
            return asset.owner.toString('hex');
        },

        getAccountAssets:async (params:Record<string, unknown>) => {
            let { address } = params;
            if (!Buffer.isBuffer(address) && typeof address === 'string') {
                address = Buffer.from(address, 'hex')
            } 
            const account = await this._dataAccess.getAccountByAddress<BitagoraAccountProps>(address as Buffer);
            return codec.toJSON(digitalAssetAccountSchema, account.digitalAsset);
        },
    };
    public reducers = {
        // Example below
        // getBalance: async (
		// 	params: Record<string, unknown>,
		// 	stateStore: StateStore,
		// ): Promise<bigint> => {
		// 	const { address } = params;
		// 	if (!Buffer.isBuffer(address)) {
		// 		throw new Error('Address must be a buffer');
		// 	}
		// 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
		// 	return account.token.balance;
		// },
    };
    public name = 'digitalAsset';
    public accountSchema = digitalAssetAccountSchema;
    public transactionAssets = [new CreateAsset(), new RequestAsset(), new ResponseAsset(), new ClaimAsset()];
    public events = [
        // Example below
        // 'digitalAsset:newBlock',
    ];
    public id = 1001;

    // public constructor(genesisConfig: GenesisConfig) {
    //     super(genesisConfig);
    // }

    // Lifecycle hooks
    public async beforeBlockApply(_input: BeforeBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async afterBlockApply(_input: AfterBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async beforeTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccoounts = genesisBlock.header.asset.accounts;
        const init_value: counter = { counter: 0 }
        await _input.stateStore.chain.set(
            CHAIN_STATE_DIGITAL_ASSETS_COUNTER,
            codec.encode(digitalAssetCounterSchema, init_value)
        );



		await setNewAsset(_input.stateStore,
            {
                owner: Buffer.alloc(24,"fai finta che non esisto"),
                fileName: "ignorami",
                fileSize: 7,
                fileHash: Buffer.alloc(4,"prov"),
                merkleRoot: Buffer.alloc(5,"prova"),
                merkleHeight: 7,
                secret: "lello",
                transactionID: Buffer.alloc(0),
                previousAssetReference: Buffer.alloc(0)
            }
        );

        await setNewChunk(_input.stateStore, {
			owner: Buffer.alloc(24,"fai finta che non esisto"),
			merkleRoot: Buffer.alloc(5,"prova"),
			hostedBy: [],
			requestedBy: [],
			allowedViewers: []
		} );

        await setNewAsset(_input.stateStore,
            {
                owner: Buffer.alloc(5,"lillo"),
                fileName: "ignorami_2",
                fileSize: 7,
                fileHash: Buffer.alloc(7,"provola"),
                merkleRoot: Buffer.alloc(4,"test"),
                merkleHeight: 7,
                secret: "lollo",
                transactionID: Buffer.alloc(0),
                previousAssetReference: Buffer.alloc(5,"prova")
            }
        );

        await setNewChunk(_input.stateStore, {
			owner: Buffer.alloc(5,"lillo"),
			merkleRoot: Buffer.alloc(4,"test"),
			hostedBy: [],
			requestedBy: [],
			allowedViewers: []
		} );

    }
}
