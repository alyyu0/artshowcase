import NavigationBar from "./navbar";

function Home() {
  return (
    <div className="cream-background">
      <NavigationBar />

      <header className="discover-header">
        <h1 className="discover-title">Discover Art</h1>
        <p className="discover-subtitle">Explore amazing artworks from talented artists</p>
      </header>
    </div>
  );
}

export default Home;