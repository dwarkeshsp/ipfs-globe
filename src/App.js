import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import { ipstackKey } from "./keys";
import Globe from "./Globe";

const TypesEnum = {
  SendingQuery: 0, //
  PeerResponse: 1, // says use
  FinalPeer: 2,
  QueryError: 3,
  Provider: 4,
  Value: 5,
  AddingPeer: 6,
  DialingPeer: 7, // setting up connection
};

function App() {
  useEffect(() => {
    async function findProviders() {
      const cid = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
      const url =
        "https://node1.delegate.ipfs.io/api/v0/dht/findprovs?arg=" +
        cid +
        "&verbose=true";
      // API seems to respond with multiple JSONs so I need to pull them together into an array
      const response = await fetch(url, {
        method: "POST",
      });
      const text = await response.text();
      const responses = text
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line));
      // for (const response of responses) {
      //   if (response.Type === 4)
      //     console.log(response.Responses[0], response.Type);
      //   else console.log(response.ID, response.Type);
      // }

      return responses;
    }

    findProviders();
  }, []);

  return (
    <div>
      <Globe />
    </div>
  );
}

export default App;
