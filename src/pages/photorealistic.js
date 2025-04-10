
import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import Navigation from '@/components/Navigation';
import dynamic from 'next/dynamic';

// Dynamically import CesiumViewer with no SSR
const CesiumViewer = dynamic(
  () => import('@/components/CesiumViewer'),
  { ssr: false }
);

export default function ThreeDMap() {
  return (
    <>
      <Head>
        <title>IITR Campus Map - 3D View</title>
        <meta name="description" content="3D map of IIT Roorkee campus with photorealistic buildings" />
      </Head>
      <Navigation />
      <div className={styles.mapContainer}>
        <CesiumViewer viewMode="3D" />
      </div>
    </>
  );
}