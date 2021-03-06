
import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { request_object } from '../../../schemas/chunks/chunk_types';
import { digitalAsset, request_status, request_type } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot } from '../utils/assets';
import { getChunkByMerkleRoot, updateChunk } from '../utils/chunks';

export type request = {
	merkleRoot: Buffer,
	mode: string
}

export class RequestAsset extends BaseAsset {
	public name = 'request';
	public id = 1;

	// Define schema for asset
		public schema = {
			$id: 'digitalAsset/request-asset',
			title: 'RequestAsset transaction asset for digitalAsset module',
			type: 'object',
			required: ['merkleRoot', 'mode'],
			properties: {
				merkleRoot:{
					dataType: 'bytes',
					fieldNumber: 1
				},
				mode: {
					dataType: 'string',
					fieldNumber: 2
				}
			}
	};

	public validate({ asset }: ValidateAssetContext<request>): void {
		// Validate your asset
		if(asset.mode !== request_type.ownership && asset.mode !== request_type.view_only) {
			throw new Error('Not a valid Request Type.')
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<request>): Promise<void> {
		
		const senderAddress = transaction.senderAddress;
		
		let chunk = await getChunkByMerkleRoot(stateStore, asset.merkleRoot);

		if (senderAddress.compare(chunk.owner) === 0){
			throw new Error("Requester is already the owner of the Asset");
		}
		
		const ro: request_object = {
			address: senderAddress,
			requestTransaction: transaction.id,
			responseTransaction: Buffer.alloc(0),
			requestType: asset.mode,
			status: request_status.pending
		};

		const index: number = chunk.requestedBy.findIndex((t) => (t.address.equals(senderAddress) && t.status !== request_status.rejected));
		if (index >= 0) {
			if (chunk.requestedBy[index].status === request_status.pending) {
				chunk.requestedBy[index].responseTransaction = transaction.id;
				chunk.requestedBy[index].status = request_status.cancelled;
			}
		} 

		chunk.requestedBy.push(ro)

		const da: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.merkleRoot);

		let senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		const index_a: number = senderAccount.digitalAsset.pending.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot));
		if (index_a >= 0) {
			senderAccount.digitalAsset.pending[index_a] = {
				fileName: da.fileName,
				merkleRoot: asset.merkleRoot
			}
		} else {
			senderAccount.digitalAsset.pending.push({
				fileName: da.fileName,
				merkleRoot: asset.merkleRoot
			});
		}
		
		const ownerAccount = await stateStore.account.get<BitagoraAccountProps>(da.owner);


		const index_r: number = ownerAccount.digitalAsset.requested_to_me.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot) && t.address.equals(senderAddress));
		if (index_r >= 0) {  
			ownerAccount.digitalAsset.requested_to_me[index_r] = {
				fileName: da.fileName,
				merkleRoot: asset.merkleRoot,
				address: senderAddress,
				mode: asset.mode
			}
		} else {
			ownerAccount.digitalAsset.requested_to_me.push({
				fileName: da.fileName,
				merkleRoot: asset.merkleRoot,
				address: senderAddress,
				mode: asset.mode
			})
		}

		await updateChunk(stateStore, chunk);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();
		await stateStore.account.set(ownerAccount.address, ownerAccount).catch();
	}
}
