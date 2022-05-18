# NeatBox

Neatbox is a distributed storage system for digital assets.

The project's development is splitted in 3 sections:

  1. Blockchain
  2. Digital Asset Manager
  3. Front End


### 1. Blockchain

The Blockchain used is Lisk; his role is to keep track of the history of an asset, guarantee the ownership and immutability of the information. 

Informations in the blockchain are stored in the [stateStore](https://lisk.com/documentation/lisk-sdk/references/lisk-elements/chain.html#state-store-and-database-mechanism). This has a key-value data structure, and data are stored using [schemas](https://lisk.com/documentation/lisk-sdk/advanced-explanations/schemas.html).

In our case two keys have been created in the stateStore, with relative schemas.

  - digitalAsset:registeredAssets
  > [registeredAssetsSchema](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_schemas.ts)
  
  - digitalAsset:registeredChunks
  > [registeredChunksSchema](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/chunks/chunk_schemas.ts)




There are 2 different ways to interact with blockchain: Transactions and Actions.

#### 1.1 Transactions
Transactions are write-only operations wich add data on the blockchain. These require the payment of a _fee_ and can be executed only by a user with a lisk's wallet with sufficent token balance.

More info on transactions and how to create them on
[this page](https://lisk.com/documentation/lisk-sdk/guides/node-management/signing-transactions-offline.html#Cookiebot).

 - ##### 1.1.1 Create
 Before creating this transaction, the file need to be processed by the front end, and this mean that the file have to be splitted into chunks, a new AES symmetric encryption key have to be generated, that will be used to encrypt the chunks. this symmetric key must be then encrypted with the wallet's public key, in this way only the owner of the wallet can decrypt it with his private key.
 
 With this transaction, 2 new elements are created in the stateStore:
  - 1 new element is created under the key: "digitalAsset:registeredAssets" <br>
    this element contain information of the digital asset and is used to rebuild his history and get eventually previous owners. Elemet stored has following type:
  ```
    type digitalAsset = {
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
  ```
    
  - 1 new element is created under the key: "digitalAsset:registeredChunks" <br>
    this element contain information about user that required access to it, and information about the address of the hosts that are storing his chunks. Elemet stored has following type:
  ```
    type chunk = {
        merkleRoot: Buffer,
        owner: Buffer,
        hostedBy: Buffer[],
        requestedBy: {
            address: Buffer,
            requestTransaction: Buffer,
            responseTransaction: Buffer,
            requestType: string,
            status: string
        }[],
        allowedViewers: {
          address: Buffer,
          secret: string
        }[],
    }
  ```
 <br><br>
 
 The _asset_ of this transaction has the following type:
 
  ```
  create = {
      fileName:string, 
      fileSize:number,  
      fileHash:Buffer,  //sha256 del file
      merkleRoot:Buffer,  //merkleRoot of th merkle three built with the file's chunks
      merkleHeight:number,
      secret:string //simmetric key, used to encrypt chunks. the simmetric key must be encryped with wallet's public key.
  }
  
  ```
 
 - ##### 1.1.2 Request
 With this transaction, a user can request to access a Digital Asset uploaded by another user, or can also request the ownership.
 
 The _asset_ of this transaction has the following type:
 
  ```
  type request = {
      merkleRoot: Buffer, // merleroot of the Digital Asset
      mode: string  // "VIEW" or "OWN"
  }
  ```
 - ##### 1.1.3 Response
 With this transaction a user respond to a request, allowing or denying it.
 
 The _asset_ of this transaction has the following type:
 
  ```
  type response = {
      address: Buffer, // address of the user that request the asset
      merkleRoot: Buffer, // merleroot of the Digital Asset
      response: string, // "OK" or "KO"
      newSecret: string //simmetric key used to encrypt chunks, encryped with the public key of the address of the user that request the asset
  }
  ```
 - ##### 1.1.4 Claim
 With this transaction a user become the new owner of a Digital Asset, after he requested the ownership to the old owner and received the approval.
 
 The _asset_ of this transaction has the following type:
 
  ```
  type claim = {
      oldMerkleRoot: Buffer, // merleroot of the Digital Asset
      newMerkleRoot: Buffer, // new merkle root, calculated on the chunks encrypted with new simmetric key
      newMerkleHeight: number,
      newHosts: Buffer[], //address of the hosts of the new chunks
      newSecret: string //new simmetric key, used to encrypt chunks. the simmetric key must be encryped with wallet's public key 
  }
  ```
 
#### 1.2 Actions

Actions are read-only operation on the blocchain, and are used to retrieve information about Digital Assets and accounts that made transacions on the blockchain.

More info on how to invoke actions on [this page](https://lisk.com/documentation/lisk-sdk/advanced-explanations/communication.html#actions).

  - ##### 1.2.1 digitalAsset:getAllAssets
  return an object of type [registeredAssets](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts) containing the list of all the Digital Assets registered in the stateStore of the blockchain.
  
  - ##### 1.2.2 digitalAsset:getAllChunks
  returns an oject of type [registeredChunks](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/chunks/chunk_types.ts) containing the list of all the chunks registered in the stateStore of the blockchain.
  
  - ##### 1.2.3 digitalAsset:getAmountOfDigitalAssets
  return the number of registered Digital Assets.
  
  - ##### 1.2.4 digitalAsset:getAllAssetsPaged
  receive in input an object of type: 
  ```
    {
      elements: number,
      page: number  
    }
  ```
  
  return an object of type [registeredAssets](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts) containing a number of digital assets specified by the value _elements_.
  
  - ##### 1.2.5 digitalAsset:getAsset
  receive in input an object of type: 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  return the address of the owner of the Digital Asset as a Buffer.
  - ##### 1.2.6 digitalAsset:getAssetOwner
  
  receive in input an object of type: 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  returns an object of type [digitalAsset](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts).
  
  - ##### 1.2.7 digitalAsset:getAssetDetail
  
  receive in input an object of type: 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  returns an object of type:
  
  ```
  {
      merkleRoot: Buffer,
      owner: Buffer,
      hostedBy: Buffer[],
      requestedBy: {
        address: Buffer,
        requestTransaction: Buffer,
        responseTransaction: Buffer,
        requestType: string,
        status: string
      }[],
      allowedViewers: {
        address: Buffer,
        secret: string
      }[],
  }
  
  ```
  - ##### 1.2.8 digitalAsset:getAssetHistory
  
  receive in input an object of type: 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  returns an object of type [registeredAssets](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts) containing the Digital Asset with the providen merkleRoot and all the previous Digital Asset, in case the ownership of the required Digital Asset changed one or more time.
  - ##### 1.2.9 digitalAsset:getAccountAssets
  receive in input an object of type: 
  ```
    {
      address: string  // formato hex
    }
  ```
  returns an object of type:
  
  ```
    pending: {
        fileName: string;
        merkleRoot: Buffer;
    }[];
    allowed: {
        fileName: string;
        merkleRoot: Buffer;
        secret: string;
    }[];
    myFiles: {
        fileName: string;
        merkleRoot: Buffer;
        secret: string;
    }[];
    requested_to_me: {
        fileName: string;
        merkleRoot: Buffer;
        address: Buffer;
        mode: string
    }[];
    to_be_claimed: {
        fileName: string;
        merkleRoot: Buffer
    }[]
  ```
  this object contains 5 lists described below:
  > - pending: list of files for which the specified address has sent a Request;
  
  > - allowed: list of files for which the specified address has requested access (not ownership) and obtained authorization;
  
  > - myFiles: list of files owned by the specified address.
  
  > - requested_to_me: list of files for which the specified address has received requests, specifying the type of request and the applicant's address.
  
  > - to_be_claimed: list of files for which the specified address has requested ownership (not access) and obtained authorization;
 
