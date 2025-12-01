import NavigationBar from "./navbar";

function Gallery() {
  return (
    <div className="cream-background">
      <NavigationBar />

      <main className="gallery-main">
        <section className="gallery-header">
          <h2 className="gallery-title">Art Gallery</h2>
          <p className="gallery-subtitle">Search by hashtags or usernames</p>

          <div className="gallery-search">
            
             
              <input
                className="form-control"
                type="text"
                aria-label="Search artworks by hashtag or username"
                placeholder="Search by hashtag or username (e.g., #digitalart or @artist)"
              />
            </div>
         
        </section>
      </main>
    </div>
  );
}

export default Gallery;