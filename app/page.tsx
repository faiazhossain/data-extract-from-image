import MapComponent from './components/Map';

export default function Home() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-8'>
      <h1 className='text-2xl font-bold mb-6'>Map Component Demo</h1>
      <MapComponent width='80%' height={500} />
    </div>
  );
}
