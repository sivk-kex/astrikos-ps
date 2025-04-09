import styles from '@/styles/Home.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} IITR Campus Map | Made by Team Enigma
      </p>
    </footer>
  );
}