type PageProps = {
  params: { layer: string };
};

// Helper to decode and format the title
const getTitle = (layer: string) => {
  try {
    const decodedLayer = decodeURIComponent(layer);
    return decodedLayer.replace(/-/g, ' ');
  } catch (e) {
    console.error("Error decoding layer name:", e);
    return "Invalid Page";
  }
};

export default function LayerPage({ params }: PageProps) {
  const title = getTitle(params.layer);

  return (
    <div>
      <h1 className="text-4xl font-bold capitalize">{title}</h1>
      <p className="mt-4 text-gray-400">Content for this layer will be displayed here.</p>
    </div>
  );
}
