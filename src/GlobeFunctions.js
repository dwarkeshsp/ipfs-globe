import parseJson from "parse-json";

const IPGeoKey = "13a068f7429343e496052365e92986ee";

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

// TODO: Change to use ipgeolocation.io Javascript API
// https://ipgeolocation.io/documentation/ip-geolocation-api.html
async function getIPGeo(IP) {
  const url =
    "https://api.ipgeolocation.io/ipgeo?apiKey=" + IPGeoKey + "&ip=" + IP;
  const response = await fetch(url);
  return parseJson(await response.text());
}

async function getPeerGeo(response) {
  async function getPeerData(ID) {
    const url =
      "https://node1.delegate.ipfs.io/api/v0/dht/findpeer?arg=" +
      ID +
      "&verbose=false";
    const apiResponse = await fetch(url, { method: "POST" });
    const text = await apiResponse.text();

    const errMessage = "failed to find any peer in table";
    if (text.includes(errMessage)) {
      console.error(errMessage, "for", ID);
      return null;
    }
    return parseJson(text);
  }

  function getAddressesIP(addresses) {
    return addresses
      .map((address) => address.split("/")[2])
      .filter((address) => address != null)
      .filter(
        (address) =>
          !address.startsWith("127") &&
          !address.startsWith("172") &&
          !address.includes(":")
      )[0];
  }

  const isProvider = Responses[response.Type].name === "Provider";
  const data = isProvider ? response : await getPeerData(response.ID);
  if (data == null) return null;
  const addresses = data.Responses[0].Addrs;
  if (!addresses.length) return null;
  const IP = getAddressesIP(addresses);
  console.log(IP);
  return await getIPGeo(IP);
}

async function getUserGeo() {
  const url = "https://api.ipgeolocation.io/ipgeo?apiKey=" + IPGeoKey;
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

async function getArcsData() {
  const providersData = await getProvidersData();
  console.log("providers Data", providersData);
  const userData = await getUserGeo();

  let arcsData = [];
  let i = 0;
  for (const response of providersData) {
    const isProvider = Responses[response.Type].name === "Provider";
    const peerID = isProvider ? response.Responses[0].ID : response.ID;
    const peerGeo = await getPeerGeo(response);
    if (peerGeo == null) continue;

    const { name, color, dashGap, labelPrefix } = Responses[response.Type];

    let startLat = userData.latitude,
      startLng = userData.longitude,
      endLat = peerGeo.latitude,
      endLng = peerGeo.longitude;

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

export { getArcsData, getUserGeo };
