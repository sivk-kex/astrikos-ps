import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <img src="/images/logo.png" alt="IITR Logo" height={40} />
        <span>IITR Campus Map</span>
      </Link>
    </header>
  );
}