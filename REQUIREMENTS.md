
|     | Requirement|
|:---:|----        |
| |User can create an account|
| |User can create a wallet|
| |User can register his wallet as a neighbor storage node|
| |When creating a wallet, System must assign to a node a list of neighbor storage node |
| |When Registering as a storage node, other nodes will upload their neighbor list |
| |A storage node must be reachable through an IP address and a Port|
| |User can upload a File|
| |System must encrypt the File using a simmetric key|
| |System must generate a _secret_, encrypting the simmetric key with his wallet's public key|
| |System must split file into chunks|
| |Parity chunks must be generated using XOR Operation|
| |Chunks must be divided and grouped into arrays|
| |Array containing chunks must be sent to neighbor storage node|
| |Uploaded File will be registered on blockchain as Digital Assets|
| |Digital Asset contain information on: <br> -owner <br>-merkle root <br>-all the request received to access the File <br>-all the users allowed to download and view the File <br>-_secret_ used to encrypt the File
| |User can retrieve a list of all Digital Assets|
| |User can request access to a Digital Asset|
| |User can request ownership of a Digital Asset|
| |User can accept or deny received request for a Digital Asset|
| |Detail about request and response for a Digital Asset are written in the Digigtal Asset|
| |User that are allowe to access a Digital Asset must be able to download and Descrypt the related File|
