import { SessionProvider } from "next-auth/react";
import "leaflet/dist/leaflet.css";



function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
