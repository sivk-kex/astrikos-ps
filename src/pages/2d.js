import Head from 'next/head';
import { useEffect, useRef } from 'react';
import styles from '@/styles/Home.module.css';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';

// Dynamically import CesiumViewer with no SSR
const CesiumViewer = dynamic(
  () => import('@/components/CesiumViewer'),
  { ssr: false }
);

export default function TwoDMap() {
  return (
    <>
      <Head>
        <title>IITR Campus Map - 2D View</title>
        <meta name="description" content="2D map of IIT Roorkee campus" />
      </Head>
      <Navigation />
      <div className={styles.mapContainer}>
        <CesiumViewer viewMode="2D" />
      </div>
    </>
  );
}