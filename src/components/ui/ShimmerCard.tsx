import './ShimmerCard.css';

export function HeroShimmer() {
    return (
        <div className="hero-shimmer">
            <div className="shimmer-content">
                <div className="shimmer-title"></div>
                <div className="shimmer-subtitle"></div>
                <div className="shimmer-button"></div>
            </div>
        </div>
    );
}

export function CarouselShimmer() {
    return (
        <div className="carousel-shimmer-section">
            <div className="shimmer-header"></div>
            <div className="shimmer-carousel">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="shimmer-card">
                        <div className="shimmer-image"></div>
                        <div className="shimmer-card-content">
                            <div className="shimmer-text shimmer-text-lg"></div>
                            <div className="shimmer-text shimmer-text-sm"></div>
                            <div className="shimmer-footer">
                                <div className="shimmer-avatar"></div>
                                <div className="shimmer-button-small"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function UpcomingShimmer() {
    return (
        <div className="upcoming-shimmer-section">
            <div className="shimmer-tabs">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer-tab"></div>
                ))}
            </div>
            <div className="shimmer-carousel">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer-card-small">
                        <div className="shimmer-image-small"></div>
                        <div className="shimmer-text shimmer-text-md"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
