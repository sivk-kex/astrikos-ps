import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>IITR Campus Map</title>
        <meta name="description" content="Interactive 2D and 3D maps of IIT Roorkee campus" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to IITR Campus Map
        </h1>
        
        <div className={styles.description}>
          <p>
            Explore the IIT Roorkee campus in both 2D and 3D views using CesiumJS technology
          </p>
        </div>

        <div className={styles.grid}>
          <Link href="/2d" className={styles.card}>
            <h2>2D Map &rarr;</h2>
            <p>View the campus in a traditional 2D map format</p>
          </Link>

          <Link href="/3d" className={styles.card}>
            <h2>3D Map &rarr;</h2>
            <p>Explore the campus with photorealistic 3D buildings</p>
          </Link>
        </div>
      </main>
    </>
  );
}