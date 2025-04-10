// src/components/Navigation.jsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Home.module.css';

export default function Navigation() {
  const router = useRouter();
  
  return (
    <nav className={styles.navigation}>
      <Link href="/">
        <span className={styles.navLink}>Home</span>
      </Link>
      <Link href="/2d">
        <span className={router.pathname === '/2d' ? styles.activeNavLink : styles.navLink}>
          2D Map
        </span>
      </Link>
      <Link href="/photorealistic">
        <span className={router.pathname === '/photorealistic' ? styles.activeNavLink : styles.navLink}>
          Photorealistic 3D
        </span>
      </Link>
      <Link href="/custommap">
        <span className={router.pathname === '/custommap' ? styles.activeNavLink : styles.navLink}>
          View your own maps
        </span>
      </Link>
    </nav>
  );
}