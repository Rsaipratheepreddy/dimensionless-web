'use client';
import './FeaturedCollections.css';

interface ArtItem {
    id: string;
    title: string;
    artist: string;
    price: number;
    category: string;
    imageUrl?: string;
}

const FeaturedCollections: React.FC = () => {
    // Placeholder data - will be replaced with Supabase data
    const artItems: ArtItem[] = [
        { id: '1', title: 'Metal Buddha', artist: 'Dimensionless', price: 33, category: 'traditional' },
        { id: '2', title: 'Zebra Vase', artist: 'Dimensionless', price: 23, category: 'modern' },
        { id: '3', title: 'Serene Landscape', artist: 'Avinsharma', price: 29, category: 'nature' },
        { id: '4', title: 'Forest Path', artist: 'Username', price: 50, category: 'nature' },
        { id: '5', title: 'MB-GClass', artist: 'Dimensionless', price: 42, category: 'vehicles' },
        { id: '6', title: 'MB-SClass', artist: 'Rebecca', price: 15, category: 'vehicles' },
        { id: '7', title: 'MB-AMG', artist: 'Keerth', price: 53, category: 'vehicles' },
        { id: '8', title: 'MB-AMG2', artist: 'Nilima', price: 63, category: 'vehicles' },
        { id: '9', title: 'Chinese Lands', artist: 'Avinsharma', price: 63, category: 'nature' },
        { id: '10', title: 'Fur Vase', artist: 'Username', price: 43, category: 'modern' },
        { id: '11', title: 'Metal Abstract', artist: 'Ajaycik', price: 33, category: 'modern' },
        { id: '12', title: 'Metal Vase', artist: 'Dimensionless', price: 65, category: 'traditional' },
    ];

    return (
        <section className="featured-collections">
            <div className="collections-header-simple">
                <h2 className="collections-title-simple">Featured Art Collections</h2>
                <p className="collections-subtitle-simple">This week's curated collection</p>
            </div>

            <div className="art-grid">
                {artItems.map((item) => (
                    <div key={item.id} className="art-card-simple">
                        <div className="art-image-simple">
                            <div className="image-placeholder-simple">
                                <span className="placeholder-text-simple">{item.title}</span>
                            </div>
                        </div>
                        <div className="art-info-simple">
                            <h3 className="art-title-simple">{item.title}</h3>
                            <p className="art-artist-simple">{item.artist}</p>
                            <div className="art-price-simple">
                                <div className="price-info">
                                    <span className="price-label-simple">Floor Price</span>
                                    <span className="price-value-simple">
                                        <span className="dmn-icon"></span>
                                        {item.price} DMN
                                    </span>
                                </div>
                                <div className="time-info">
                                    <div className="time-label">Ending In</div>
                                    <div className="time-value">2D 14H</div>
                                </div>
                            </div>
                            <button className="place-bid-btn">Place a Bid</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedCollections;
