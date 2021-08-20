# Introducing IPFS Globe

On IPFS, files are identified by their unique CIDs. Suppose that I know the CID of the file I'm looking for. How do I find the addresses of the hosts who are serving that file? The global IPFS network is big, and very few people will be hosting the specific file I want. It would be impractical to ask every person in the world running an IPFS node if they're hosting that file.

## How Kademlia works

To solve this problem, people created [distributed hash tables](https://www.wikiwand.com/en/Distributed_hash_table). IPFS uses a distributed hash table protocol called [Kademlia](https://www.wikiwand.com/en/Kademlia).

Here's the big picture explanation for how Kademlia works. If Alice is hosting a file, she will ask a peer who has a peer ID closest to the file's CID to host a provider record for the file. The provider record basically says, "Alice is hosting this file and here's her IP address." If Bob wants to download the file, all he has to do is find the peer hosting this provider record.

Bob finds this peer the same way that Alice did - by finding out who has a peer ID closest to the CID of the file he's looking for. Here's how he finds this peer. Every peer in the network stores a list of some peers who have a similar peer ID to themselves. Bob checks for a peer he knows whose peer ID is less different from the file CID that his is. He asks them if they know a peer whose ID is even less different. He repeats this with the new peer. He keeps doing this until he finds the peer who has a peer ID closest to the file CID. Alice gave this peer her provider record. Bob uses this record to find Alice. Now that he's found the person hosting the file, he can finally download it.

## IPFS Globe

**To better understand how Kademlia works and to show how it finds content you want in a decentralized way, we created a tool called [IPFS Globe](https://ipfs-globe.netlify.app/).** IPFS Globe is a 3D visualization which shows you how Kademlia locates the providers for the CID you specify. 

### Possible extensions

IPFS Globe is meant to be a simple explainer tool, but it can be easily extended and modified for practical uses. A fork of this project could visualize the density of peers and providers in different areas. Another could highlight parts of the network where responses are slow or the algorithm is inefficient. The underlying [library](https://github.com/vasturiano/react-globe.gl) used to render the globe allows for many different types of visualizations.

### User instructions

By default, IPFS Globe uses a IPFS server node to gather this data, but it can use your computer's daemon instead if you follow these [instructions](https://github.com/dwarkeshsp/ipfs-globe/blob/master/README.md). Currently, it works on Chrome and Firefox but not on Brave Browser. The source code for the project can be found [here](https://github.com/dwarkeshsp/ipfs-globe).