# NeatBox

NeatBox è un sistema di storage distribuito di asset digitali. 

Lo sviluppo del progetto è stato diviso in 3 parti.

  1. La Blockchain
  2. Il Digital Asset Manager
  3. Il Front End

### 1. La Blockchain

La blockchain utilizzata è stata Lisk. Questa deve tenere traccia della storia di un asset, garantirne la proprietà e l'immutabilità. 

Le informazioni nella blockchain sono salvate all'interno dello [stateStore](https://lisk.com/documentation/lisk-sdk/references/lisk-elements/chain.html#state-store-and-database-mechanism) della stessa. Questo ha una struttura chiave-valore ed al suo interno le informazioni vengono immagazinate con uno schema predefinito.

Sono stati creati due tipi e relativo schema da inserire all'interno dello stateStore: 

  - digitalAsset:registeredAssets
  > [registeredAssetsSchema](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_schemas.ts)
  
  - digitalAsset:registeredChunks
  > [registeredChunksSchema](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/chunks/chunk_schemas.ts)



Ci sono 2 diversi modi per interagire con la blockchain: le Transazioni e le Actions.

#### 1.1 Le Transazioni

Le transazioni sono operazioni di scrittura che agiungono dati alla blockchain. Queste prevedono il pagamento di una _fee_ e possono essere eseguite solo da chi possiede un wallet sulla blockchain lisk e possiede dei crediti.

Maggiori dettagli sulle transazioni e su come crearle su
[questa pagina](https://lisk.com/documentation/lisk-sdk/guides/node-management/signing-transactions-offline.html#Cookiebot).

 - ##### 1.1.1 Create
 con questa transazione viene creato un nuovo elemento nello state store della blockchain.
 
 L'asset di questa transazione deve avere il seguente tipo:
 
  ```
  create = {
      fileName:string, //nome del file
      fileSize:number,  //dimensione del file
      fileHash:Buffer,  //sha256 del file
      merkleRoot:Buffer,  //merkleRoot del merkle three costruito con i chunks del file
      merkleHeight:number,
      secret:string //chiave simmetrica utilizzata per cifrare i chunks, cifrata con la chiave pubblica del wallet
  }
  
  ```
 
 - ##### 1.1.2 Request
 con questa transazione viene richiesto l'accesso o la proprietà di un asset.
 
 L'asset di questa transazione deve avere il seguente tipo:
 
  ```
  type request = {
      merkleRoot: Buffer, // il merle root, identificativo del file che si vuole richiedere
      mode: string  // "VIEW" o "OWN"
  }
  ```
 - ##### 1.1.3 Response
 con questa transazione si risponde ad una richiesta, autorizzandola o negandola.
 
 L'asset di questa transazione deve avere il seguente tipo:
 
  ```
  type response = {
      address: Buffer, // indirizzo che ha richiesto accesso al file
      merkleRoot: Buffer, // il merle root, identificativo del file 
      response: string, // "OK" o "KO"
      newSecret: string //chiave simmetrica utilizzata per cifrare i chunks, cifrata con la chiave pubblica del wallet del richiedente
  }
  ```
 - ##### 1.1.4 Claim
 con questa transazione si diventa nuovi proprietari di un asset, dopo averne richiesto la proprietà al proprietario precedente ed averne ricevuto l'approvazione.
 
 L'asset di questa transazione deve avere il seguente tipo:
 
  ```
  type claim = {
      oldMerkleRoot: Buffer, // il merle root, identificativo del file che si vuole richiedere
      newMerkleRoot: Buffer, // nuovo merkle root, calcolato con i chunks cifrati con la nuova chiave simmetrica
      newMerkleHeight: number,
      newHosts: Buffer[], //hosts sui quali sono stati caricati i nuovi chunks
      newSecret: string //nuova chiave simmetrica utilizzata per cifrare i chunks, cifrata con la chiave pubblica del wallet 
  }
  ```
 
#### 1.2 Le Actions

Le actions sono operazioni di lettura, e servono a recuperare informazioni sugli asset e sugli account che hanno eseguito operazioni sulla blockchain.

Dettagli su come invocare una actions su [questa pagina](https://lisk.com/documentation/lisk-sdk/advanced-explanations/communication.html#actions).

  - ##### 1.2.1 digitalAsset:getAllAssets
  restituisce un ogetto di tipo [registeredAssets](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts) contenente la lista di tutti gli asset registrati nello stateStore.
  
  - ##### 1.2.2 digitalAsset:getAllChunks
  restituisce un ogetto di tipo registeredChunks contenente la lista di tutti i chunks registrati nello stateStore.
  
  - ##### 1.2.3 digitalAsset:getAsset
  bisogna passargli in ingresso un parametro di tipo 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  restituisce l'indirizzo del proprietario dell'asset in tipo Buffer.
  - ##### 1.2.4 digitalAsset:getAssetOwner
  
  bisogna passargli in ingresso un parametro di tipo 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  restituisce un oggetto di tipo [digitalAsset](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts).
  
  - ##### 1.2.5 digitalAsset:getAssetHistory
  
  bisogna passargli in ingresso un parametro di tipo 
  ```
    {
      merkleRoot: string  // formato hex
    }
  ```
  restituisce un ogetto di tipo [registeredAssets](https://github.com/BlockchainLabItalia/neatbox/blob/main/src/app/schemas/digital_asset/digital_asset_types.ts) contenente l'asset relativo al merkle root specificato e tutti gli asset precedenti, in caso questo sia stato trasferito una o più volte.
  - ##### 1.2.6 digitalAsset:getAccountAssets
  bisogna passargli in ingresso un parametro di tipo 
  ```
    {
      address: string  // formato hex
    }
  ```
  restituisce un oggetto di tipo
  
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
  ```
  questo oggetto contiene 3 liste rappresentanti i seguenti dati:
  > - pending: la lista di files per i quali l'indirizzo specificato ha inviato una Request;
  
  > - allowed: la lista di files per i quali l'indirizzo specificato ha richiesto l'accesso (non la proprietà) ed ottenuto l'autorizzazione;
  
  > - myFiles: la lista di files di cui l'indirizzo specificato è il proprietario.
  
#### 1.3 Plugins

I plugins sono componenti esterni alla blockchain, ma che possono interagire con essa e fornire funzionalità aggiuntive. Maggiori informazioni sui plugins su [questa pagina](https://lisk.com/documentation/lisk-sdk/introduction/plugins.html).

