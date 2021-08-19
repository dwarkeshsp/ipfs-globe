# Introducing IPFS Globe

IPFS is a file system for the decentralized web. In the decentralized web, files are not found by just accessing with the server that hosts them. Instead, you ask the network which peers are hosting the file corresponding to a specific CID. The network responds with a list of providers for that file, and then you can download the content from them directly. 

But this is a bit handwavy. The global IPFS network is big, and very few people will be hosting the specific file you're looking for. It's unlikely that any peer you ping will know exactly who is storing the file you want.

To solve this problem, people created [distributed hash tables](). IPFS uses a type of distributed hash table called [Kademlia](). We can't cover how Kademlia works here, though there are many other resources which explain it in detail. The big picture idea is that...

To better understand how Kademlia works and to visualize the process by which it finds content we want in a decentralized way, we created a tool called [IPFS Globe](). IPFS Globe is a 3-d visualization which shows you how Kademlia locates the providers for the CID you specify. 

IPFS Globe is meant to be a simple explainer tool, but it can be easily extended and modified for practical uses. A fork of this project could visualize the density of peers and providers in different areas. Another could highlight parts of the network where responses are slow or the algorithm is inefficient. The underlying [library]() used to render the globe allows for many different types of visualizations.  

By default, IPFS Globe uses a IPFS server node to gather this data, but it can use your own daemon to do this too if you follow these [instructions](). Currently, it works on Chrome and Firefox but not on Brave Browser. The source code for the project can be found [here]()
