import { Typography, TextField, Button, Link, Grid } from "@material-ui/core";
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
  const [usingDaemon, setUsingDaemon] = useState(null);

  useEffect(() => {
    async function initializeGlobe() {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.1;
      const { latitude, longitude } = await getUserGeo();
      globeEl.current.pointOfView({ lat: latitude, lng: longitude }, 1000);
    }

    async function testDaemon() {
      try {
        await fetch("http://127.0.0.1:5001/api/v0/version", {
          method: "POST",
        });
        setUsingDaemon(true);
      } catch (error) {
        console.error(error);
        setUsingDaemon(false);
      }
    }

    initializeGlobe();
    testDaemon();
  }, []);

  useEffect(() => {
    if (!arcsData.length) {
      return;
    }

    let index = 0;
    function updateDescription() {
      if (index < arcsData.length) {
        const { description, isProvider, peerID } = arcsData[index];
        if (isProvider) {
          setProviders((providers) => [...providers, peerID]);
        }
        setDescription(description);
        index++;
        setTimeout(updateDescription, 1000);
      } else {
        setDescription("");
      }
    }

    updateDescription();
  }, [arcsData]);

  return (
    <div>
      <Header
        CID={CID}
        setCID={setCID}
        description={description}
        setDescription={setDescription}
        setArcsData={setArcsData}
        usingDaemon={usingDaemon}
      />
      <Footer providers={providers} usingDaemon={usingDaemon} />
      <Globe
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
}

function Header({
  CID,
  setCID,
  description,
  setDescription,
  setArcsData,
  usingDaemon,
}) {
  async function handleSearch(e) {
    e.preventDefault();
    setDescription("Loading...");
    const arcsData = await getArcsData(CID, usingDaemon);
    setArcsData(arcsData);
  }

  return (
    <div
      style={{
        zIndex: 1,
        width: "100vw",
        position: "absolute",
        textAlign: "center",
        paddingTop: "0.5rem",
      }}
      container
    >
      <Typography variant="h4">
        IPFS Globe{" "}
        <Link
          variant="caption"
          href="https://github.com/dwarkeshsp/ipfs-globe/"
          target="_blank"
        >
          Source
        </Link>
      </Typography>
      <Typography variant="body2" gutt>
        See how the IPFS DHT locates the providers for the CID you specify
      </Typography>
      <Grid
        style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
        container
        // spacing={3}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item>
          <TextField
            label="CID"
            value={CID}
            onChange={(e) => setCID(e.target.value)}
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Button onClick={handleSearch} variant="contained">
            Search
          </Button>
        </Grid>
      </Grid>
      <Typography variant="body1">{description}</Typography>
    </div>
  );
}

function Footer({ providers, usingDaemon }) {
  return (
    <Grid
      style={{
        zIndex: 1,
        position: "absolute",
        bottom: 0,
        width: "100vw",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingBottom: "1rem",
      }}
      container
      justifyContent="space-between"
      alignItems="flex-end"
    >
      <Grid item>
        <Typography variant="body1">Providers Found:</Typography>
        {providers.length &&
          providers.map((provider) => (
            <Typography variant="body2">{provider}</Typography>
          ))}
      </Grid>
      <Grid item>
        {usingDaemon !== null && usingDaemon ? (
          <Typography>Connected to your local daemon. </Typography>
        ) : (
          <Typography>
            Using an IPFS Node. To use your local daemon, follow these{" "}
            <Link
              href="https://github.com/dwarkeshsp/ipfs-globe/blob/master/README.md"
              target="_blank"
            >
              instructions
            </Link>
            .
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}
