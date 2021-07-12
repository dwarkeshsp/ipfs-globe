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

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.1;
    getUserGeo().then(({ latitude, longitude }) =>
      globeEl.current.pointOfView({ lat: latitude, lng: longitude }, 1000)
    );

    handleSubmit();
  }, []);

  useEffect(() => {
    if (!arcsData.length) {
      return;
    }

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
  }, [arcsData]);

  async function handleSubmit() {
    setDescription("Loading...");
    console.log("getting arcs data");
    const arcsData = await getArcsData(CID);
    setArcsData(arcsData);
  }

  return (
    <React.Fragment>
      <div
        style={{
          zIndex: 1,
          position: "absolute",
          width: "100vw",
        }}
      >
        <h1 style={{ textAlign: "center" }}>IPFS Globe</h1>
        {/* <form
          onSubmit={() => {
            console.log("submitting");
          }}
        >
          <label>
            CID:
            <input
              type="CID"
              value={CID}
              onChange={(e) => setCID(e.target.value)}
            />
          </label>
          <input type="submit" value="Submit" />
        </form> */}
        <h3>{description}</h3>
      </div>
      <Globe
        // height={window.innerHeight * 0.9}
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={arcsData}
        arcColor={(d) => d.color}
        arcLabel={(d) => d.label}
        arcDashLength={0.5}
        arcDashGap={(d) => d.dashGap}
        arcDashInitialGap={(d) => d.index}
        arcDashAnimateTime={1000}
        // TODO
        // onArcHover={() => null}
      />
    </React.Fragment>
  );
}
