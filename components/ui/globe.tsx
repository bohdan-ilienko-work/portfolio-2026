"use client";

import { Canvas, extend } from "@react-three/fiber";
import type { ThreeElement } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { useEffect, useMemo, useRef } from "react";
import type { MeshPhongMaterial } from "three";
import ThreeGlobe from "three-globe";

import countries from "@/data/globe.json";

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElement<typeof ThreeGlobe>;
  }
}

extend({ ThreeGlobe });

const CAMERA_DISTANCE = 300;
const ARC_TIME = 1000;
const ARC_LENGTH = 0.9;
const CAMERA = { fov: 50, near: 180, far: 1800, position: [0, 0, CAMERA_DISTANCE] as [number, number, number] };

type Arc = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

type GlobeConfig = {
  globeColor: string;
  atmosphereColor: string;
  emissive: string;
  emissiveIntensity: number;
  polygonColor: string;
  ambientLight: string;
};

type WorldProps = {
  globeConfig: GlobeConfig;
  data: Arc[];
  active: boolean;
  onReady: () => void;
};

function getArcEndpoints(arcs: Arc[]) {
  const points = new Map<string, { lat: number; lng: number; color: string }>();

  function addPoint(lat: number, lng: number, color: string) {
    const key = `${lat},${lng}`;
    if (!points.has(key)) points.set(key, { lat, lng, color });
  }

  for (const arc of arcs) {
    addPoint(arc.startLat, arc.startLng, arc.color);
    addPoint(arc.endLat, arc.endLng, arc.color);
  }

  return [...points.values()];
}

function Globe({ globeConfig, data, active }: Omit<WorldProps, "onReady">) {
  const globeRef = useRef<ThreeGlobe>(null);
  const points = useMemo(() => getArcEndpoints(data), [data]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .atmosphereAltitude(0.1)
      .arcsData(data)
      .arcColor("color")
      .arcAltitude("arcAlt")
      .arcStroke(0.3)
      .arcCurveResolution(32)
      .arcCircularResolution(5)
      .arcDashLength(ARC_LENGTH)
      .arcDashInitialGap("order")
      .arcDashGap(15)
      .arcDashAnimateTime(ARC_TIME)
      .arcsTransitionDuration(0)
      .pointsData(points)
      .pointColor("color")
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(2)
      .pointResolution(8)
      .ringColor((point: object) => {
        const color = (point as (typeof points)[number]).color;
        return (t: number) => `${color}${Math.round((1 - t) * 255).toString(16).padStart(2, "0")}`;
      })
      .ringMaxRadius(3)
      .ringResolution(24)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(ARC_TIME * ARC_LENGTH);

    return () => {
      globe.ringsData([]);
      globe.pauseAnimation();
    };
  }, [data, points]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const material = globe.globeMaterial() as MeshPhongMaterial;
    material.color.set(globeConfig.globeColor);
    material.emissive.set(globeConfig.emissive);
    material.emissiveIntensity = globeConfig.emissiveIntensity;
    material.shininess = 0.9;
    globe.atmosphereColor(globeConfig.atmosphereColor).hexPolygonColor(globeConfig.polygonColor);
  }, [globeConfig]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    if (!active) {
      globe.pauseAnimation();
      return;
    }

    globe.resumeAnimation();

    const updateRings = () => {
      globe.ringsData(points.filter(() => Math.random() < 0.6));
    };

    updateRings();
    const timer = window.setInterval(updateRings, 2000);
    return () => window.clearInterval(timer);
  }, [active, points]);

  return <threeGlobe ref={globeRef} />;
}

export function World({ onReady, ...props }: WorldProps) {
  return (
    <Canvas
      camera={CAMERA}
      dpr={[1, 1.25]}
      frameloop={props.active ? "always" : "never"}
      onCreated={({ gl }) => {
        gl.setClearColor(0xffaaff, 0);
        onReady();
      }}
    >
      <fog attach="fog" args={[0xffffff, 400, 2000]} />
      <ambientLight color={props.globeConfig.ambientLight} intensity={0.6} />
      <directionalLight position={[-400, 100, 400]} />
      <directionalLight position={[-200, 500, 200]} />
      <pointLight position={[-200, 500, 200]} intensity={0.8} />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={CAMERA_DISTANCE}
        maxDistance={CAMERA_DISTANCE}
        autoRotateSpeed={1}
        autoRotate={props.active}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}
