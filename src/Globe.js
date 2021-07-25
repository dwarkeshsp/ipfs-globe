import { Typography, TextField, Button } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { getArcsData, getUserGeo } from "./GlobeFunctions";

export default function GlobeWrapper() {
  const globeEl = useRef();
  const [arcsData, setArcsData] = useState([]);
  const [description, setDescription] = useState("");
  const [CID, setCID] = useState(
    "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"
  );
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.1;
    getUserGeo().then(({ latitude, longitude }) =>
      globeEl.current.pointOfView({ lat: latitude, lng: longitude }, 1000)
    );
  }, []);

  useEffect(() => {
    if (!arcsData.length) {
      return;
    }
    for (const arcData of arcsData) console.log(arcData.description);
    console.log("\n\n");

    let index = 0;
    const interval = setInterval(() => {
      if (index < arcsData.length) {
        const { description, isProvider, peerID } = arcsData[index];
        if (isProvider) {
          setProviders((providers) => [...providers, peerID]);
        }
        console.log(description);
        setDescription(description);
        index++;
      } else {
        console.log("done with labels");
        setDescription("");
        return;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [arcsData]);

  return (
    <div>
      <Header />
      <Footer />
      <Globe
        // height={window.innerHeight * 0.9}
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={arcsData}
        arcColor={(d) => d.color}
        arcLabel={(d) => d.description}
        arcDashLength={0.25}
        arcDashGap={(d) => d.dashGap}
        arcDashInitialGap={(d) => d.index}
        arcDashAnimateTime={1000}
      />
    </div>
  );

  function Header() {
    async function handleSubmit(e) {
      e.preventDefault();
      setDescription("Loading...");
      console.log("getting arcs data");
      const arcsData = await getArcsData(CID);
      setArcsData(arcsData);
    }

    return (
      <div
        style={{
          zIndex: 1,
          width: "100vw",
          position: "absolute",
          textAlign: "center",
        }}
      >
        <Typography style={{ top: "10px" }} variant="h4" gutterBottom>
          IPFS Globe
        </Typography>
        <Typography variant="caption" paragraph>
          See how the DHT locates the providers for the CID you specify
        </Typography>
        <div style={{ marginBottom: "1rem" }}>
          <TextField
            label="CID"
            value={CID}
            onChange={(e) => setCID(e.target.value)}
            variant="outlined"
          />
          <Button
            style={{ top: "10px", left: "25px" }}
            onClick={handleSubmit}
            variant="contained"
          >
            Search
          </Button>
        </div>
        <Typography variant="h6">{description}</Typography>
      </div>
    );
  }

  function Footer() {
    return (
      <div
        style={{
          zIndex: 1,
          position: "absolute",
          bottom: 0,
          marginBottom: "1rem",
        }}
      >
        <div style={{ marginLeft: "1rem" }}>
          <Typography variant="h5">Providers Found:</Typography>
          {providers.map((provider) => (
            <Typography>{provider}</Typography>
          ))}
        </div>
      </div>
    );
  }
}
