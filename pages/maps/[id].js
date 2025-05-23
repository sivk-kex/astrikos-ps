import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('../../components/MapViewer'), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>Loading...</div>;

  return (
    <div>
      <h1>Map Viewer</h1>
      <MapViewer mapId={id} />
    </div>
  );
}
