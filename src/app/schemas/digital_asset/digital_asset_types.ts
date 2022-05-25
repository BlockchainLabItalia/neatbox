export type digitalAsset = {
	owner:Buffer,
	fileName:string,
	fileSize:number,
	fileHash:Buffer,
	merkleRoot:Buffer,
	merkleHeight:number,
	secret:string,
	transactionID: Buffer,
	previousAssetReference: Buffer
}

export type digitalAssetHistory = {
	merkleRoot: string,
	owner: string,
	requests: request[],
	previousVersion?: digitalAssetHistory
}

export type request = {
	address: string,
	mode: string,
	status: string
}

export type counter = {
	counter: number
}

export type registeredAssets = {
	registeredAssets: digitalAsset[]
}

export enum request_type {
	view_only = "VIEW",
	ownership = "OWN"
}

export enum request_status {
	pending = "PENDING",
	accepted = "ACCEPTED",
	rejected = "REJECTED",
	cancelled = "CANCELLED"
}

export enum response_type {
	ok = "OK",
	ko = "KO"
}