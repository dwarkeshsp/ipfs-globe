import React, { useEffect, useRef, useState } from "react";
import parseJson from "parse-json";
import Globe from "react-globe.gl";
import { ipstackKey } from "./keys";

// TODO: Change to use ipgeolocation.io Javascript API
// https://ipgeolocation.io/documentation/ip-geolocation-api.html
async function getIPGeo(ip) {
  const url = "http://api.ipstack.com/" + ip + "?access_key=" + ipstackKey;
  const response = await fetch(url);
  return parseJson(await response.text());
}

async function getPeerData(ID) {
  console.log("peed id", ID);
  const url =
    "https://node1.delegate.ipfs.io/api/v0/dht/findpeer?arg=" +
    ID +
    "&verbose=false";
  const response = await fetch(url, { method: "POST" });
  const text = await response.text();

  const errMessage = "failed to find any peer in table";
  if (text.includes(errMessage)) {
    console.error(errMessage, "for", ID);
    return null;
  }

  const data = parseJson(text);
  console.log("peer data", data);
  const addresses = data.Responses[0].Addrs;
  const ip = addresses
    .map((address) => address.split("/")[2])
    .filter((address) => address != null)
    .filter(
      (address) =>
        !address.startsWith("127") &&
        !address.startsWith("172") &&
        !address.includes(":")
    )[0];

  return await getIPGeo(ip);
}

async function getUserGeo() {
  const url = "http://api.ipstack.com/check?access_key=" + ipstackKey;
  const response = await fetch(url);
  return parseJson(await response.text());
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
    .map((line) => parseJson(line));
  return providersData;
}

async function getArcData() {
  const LARGE = 100000;
  function Response(name, color, dashGap, labelPrefix) {
    this.name = name;
    this.color = color;
    this.dashGap = dashGap;
    this.labelPrefix = labelPrefix;
  }

  const Responses = [
    new Response("SendingQuery", "red", LARGE, "Sending query to"),
    new Response("PeerResponse", "yellow", LARGE, "Recieving response from"),
    new Response("FinalPeer", "orange", LARGE, ""),
    new Response("QueryError", "black", LARGE, ""),
    new Response("Provider", "green", 0.5, "Provider found"),
    new Response("Value", "violet", LARGE, ""),
    new Response("AddingPeer", "white", LARGE, ""),
    new Response("DialingPeer", "blue", LARGE, "Dialing"),
  ];

  const providersData = await getProvidersData();
  console.log("providers Data", providersData);
  const userData = await getUserGeo();

  let arcsData = [];
  let i = 0;
  for (const response of providersData) {
    const isProvider = Responses[response.Type].name === "Provider";
    if (isProvider) continue;
    const peerID = isProvider ? response.Responses[0].ID : response.ID;
    const peerData = await getPeerData(peerID);
    if (peerData == null) continue;

    const { name, color, dashGap, labelPrefix } = Responses[response.Type];

    let startLat = userData.latitude,
      startLng = userData.longitude,
      endLat = peerData.latitude,
      endLng = peerData.longitude;

    if (name === "PeerResponse")
      [startLat, startLng, endLat, endLng] = [
        endLat,
        endLng,
        startLat,
        startLng,
      ];

    arcsData.push({
      startLat: startLat,
      startLng: startLng,
      endLat: endLat,
      endLng: endLng,
      color: color,
      dashGap: dashGap,
      description: [labelPrefix, peerID.substring(0, 5), "..."].join(" "),
      initialGap: i,
    });

    i++;
  }

  console.log("final arcs data", arcsData);
  return arcsData;
}

export default function GlobeWrapper() {
  const globeEl = useRef();
  const [arcsData, setArcsData] = useState([]);
  const [description, setDescription] = useState("");
  // const startTime = useRef(new Date());

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.1;
    getUserGeo().then(({ latitude, longitude }) =>
      globeEl.current.pointOfView({ lat: latitude, lng: longitude }, 1000)
    );

    // getArcData().then((data) => setArcsData(data));
  }, []);

  useEffect(() => {
    arcsData.length && console.log("arcsData", arcsData);
    if (!arcsData.length) {
      return;
    }
    const FOCUSTIME = 1000;

    let index = 0;

    const interval = setInterval(() => {
      if (index < arcsData.length) {
        setDescription(arcsData[index].description);
        index++;
      } else {
        setDescription("");
      }
    }, 1000);
    return () => clearInterval(interval);

    // const endTime = new Date();
    // const delay = (endTime - startTime.current + 2 * FOCUSTIME) / 1000;
    // const delay = 1;

    // console.log("delay (s):", delay);
    // for (let i = 0; i < arcsData.length; i++) {
    //   arcsData[i].initialGap += delay;
    // }
  }, [arcsData]);

  return (
    <React.Fragment>
      {/* <div style={{ height: "10vh"}}>
        <h3>{description}</h3>
      </div> */}
      <Globe
        // height={window.innerHeight * 0.9}
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={arcsData}
        arcColor={(d) => d.color}
        arcLabel={(d) => d.label}
        arcDashLength={0.5}
        arcDashGap={10000}
        arcDashInitialGap={(d) => d.initialGap}
        arcDashAnimateTime={1000}
        // TODO
        // onArcHover={() => null}
      />
    </React.Fragment>
  );
}
