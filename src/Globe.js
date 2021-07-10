import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { getArcsData, getUserGeo } from "./GlobeFunctions";

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

    getArcsData().then((data) => setArcsData(data));
  }, []);

  useEffect(() => {
    arcsData.length && console.log("arcsData", arcsData);
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

    // const FOCUSTIME = 1000;
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
        arcDashGap={(d) => d.dashGap}
        arcDashInitialGap={(d) => d.index}
        arcDashAnimateTime={1000}
        // TODO
        // onArcHover={() => null}
      />
    </React.Fragment>
  );
}
