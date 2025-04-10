// src/pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>Mapping Platform</title>
        <meta name="description" content="Interactive 2D and Photorealistic 3D maps of IIT Roorkee campus" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Mapping Platform
        </h1>
        
        <div className={styles.description}>
          <p>
            Explore the IIT Roorkee campus in both 2D and photorealistic 3D views
          </p>
        </div>

        <div className={styles.grid}>
          <Link href="/2d" className={styles.card}>
            <h2>2D Map &rarr;</h2>
            <p>View the campus in a traditional 2D map format</p>
          </Link>

          <Link href="/photorealistic" className={styles.card}>
            <h2>Photorealistic 3D &rarr;</h2>
            <p>Explore the campus with Google's photorealistic 3D buildings</p>
          </Link>

          <Link href="/custommap" className={styles.card}>
            <h2>Custom Maps &rarr;</h2>
            <p>View your own maps</p>
          </Link>
        </div>
      </main>
    </>
  );
}