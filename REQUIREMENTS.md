|     | Functional Requirements|
|:---:|----        |
| |User can create an account|
| |User can create a wallet|
| |When creating a wallet, some token must be funded to it|
| |User can register his wallet as a neighbor storage node|
| |When creating a wallet, System must assign to a node a list of neighbor storage node |
| |When Registering as a storage node, other nodes will upload their neighbor list |
| |A storage node must be reachable through an IP address and a Port|
| |User can get the IP address and the Port of any storage node|
| |User can upload a File|
| |System must encrypt the File using a simmetric key|
| |System must generate a _secret_, encrypting the simmetric key with user's wallet's public key|
| |System must split encrypted File into chunks|
| |All the chunksk must have the same length. Eventually smaller chunks must be 'padded'.|
| |System generate a merkle three using chunks as leaf|
| |Parity chunks must be generated using XOR Operation|
| |Chunks (including parity chunks) must be divided and grouped into arrays|
| |Number of arrays that contain chunks must be at most equals to number of neighbor|
| |Array containing chunks must be sent to neighbor storage node|
| |Uploaded File will be registered on blockchain as Digital Assets|
| |Digital Asset contain information on: <br> -owner <br>-merkle root <br>-all the request received to access the File <br>-all the users allowed to download and view the File <br>-list of addresses of the storage nodes that host chunks of the File<br>-_secret_ used to encrypt the File|
| |User can retrieve a list of all Digital Assets|
| |User can retrieve a list of the Digital Assets he owns|
| |User can retrieve a list of the Digital Assets he requested|
| |User can retrieve a list of the Digital Assets he is allowed to view|
| |User can request access to a Digital Asset|
| |User can request ownership of a Digital Asset|
| |User can accept or deny received request for a Digital Asset|
| |Detail about request and response for a Digital Asset must be written in the Digital Asset|
| |User that are allowed to access a Digital Asset must be able to download and Descrypt the related File|
| |User can Download File related to Digital Asset he own|
| |User can Download File related to Digital Asset he is allowed to view|
| |User can retrieve chunks from the neighbor addresses of the Digital Asset|
| |System must rebuild encrypted File from chunks|
| |before rebuilding, System control if a chunk is a parity chunk or not|
| |before rebuilding, System control if he has all the necessary chunks|
| |before rebuilding, if some chunks are missing, System control if is possible to restore them using parity chunks|
| |System Decrypt restored File using secret|
