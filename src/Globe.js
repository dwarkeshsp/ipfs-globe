import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { ipstackKey } from "./keys";

async function ipLookup(ip) {
  const url = "http://api.ipstack.com/" + ip + "?access_key=" + ipstackKey;
  const response = await fetch(url);
  return await response.json();
}

async function getPeerData(ID) {
  const url =
    "https://node1.delegate.ipfs.io/api/v0/dht/findpeer?arg=" +
    ID +
    "&verbose=true";
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();
  const addresses = data.Responses[0].Addrs;
  const ip = addresses
    .map((address) => address.split("/")[2])
    .filter(
      (address) =>
        !address.startsWith("127") &&
        !address.startsWith("172") &&
        !address.includes(":")
    )[0];

  return await ipLookup(ip);
}

async function getUserData() {
  const url = "http://api.ipstack.com/check?access_key=" + ipstackKey;
  const response = await fetch(url);
  return await response.json();
}

async function getProvidersData() {
  const ID = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
  const url =
    "https://node1.delegate.ipfs.io/api/v0/dht/findprovs?arg=" +
    ID +
    "&verbose=true";
  // API seems to respond with multiple JSONs so I need to pull them together into an array
  const response = await fetch(url, { method: "POST" });
  const text = await response.text();
  const providersData = text
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
  return providersData;
}

async function getArcData() {
  const Types = {
    SendingQuery: 0,
    PeerResponse: 1, // gives nodes to use
    FinalPeer: 2,
    QueryError: 3,
    Provider: 4,
    Value: 5,
    AddingPeer: 6,
    DialingPeer: 7, // setting up connection
  };

  const colors = [
    "red",
    "yellow",
    "blue",
    "orange",
    "green",
    "violet",
    "white",
    "black",
  ];

  const providersData = await getProvidersData();
  const userData = await getUserData();

  let arcsData = [];
  let i = 0;
  while (providersData[i].Type === Types.SendingQuery) {
    const peerData = await getPeerData(providersData[i].ID);
    arcsData.push({
      startLat: userData.latitude,
      startLng: userData.longitude,
      endLat: peerData.latitude,
      endLng: peerData.longitude,
      color: colors[providersData[i].Type],
    });
    i++;
  }

  return arcsData;
}

export default function GlobeWrapper() {
  const globeEl = useRef();
  const [arcsData, setArcsData] = useState([]);

  useEffect(() => {
    getArcData().then((data) => setArcsData(data));
  }, []);

  useEffect(() => {
    console.log(arcsData);
    if (arcsData.length) {
      const { startLat, startLng } = arcsData[0];
      globeEl.current.pointOfView({ lat: startLat, lng: startLng });
    }
  }, [arcsData]);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      arcsData={arcsData}
      arcColor={"color"}
      arcDashLength={() => Math.random()}
      arcDashGap={() => Math.random()}
      arcDashAnimateTime={() => Math.random() * 4000 + 500}
    />
  );
}
