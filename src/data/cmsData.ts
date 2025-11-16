export interface CMSData {
    site: {
        name: string;
        tagline: string;
        description: string;
    };
    navigation: {
        brand: {
            name: string;
            link: string;
            logo: {
                light: string;
                dark: string;
            };
        };
        menu: {
            label: string;
            type: 'dropdown' | 'link';
            link?: string;
            items?: {
                name: string;
                link: string;
            }[];
            tabs?: {
                id: string;
                label: string;
                sections: {
                    title: string;
                    items: {
                        name: string;
                        icon: string;
                        description: string;
                        link: string;
                        badge?: string;
                    }[];
                }[];
            }[];
            featured?: {
                title: string;
                description: string;
                image: string;
                link: string;
                version?: string;
                features?: string[];
            };
        }[];
        additionalLinks: {
            label: string;
            link: string;
        }[];
        cta: {
            label: string;
            action: string;
        };
    };
    hero: {
        badge: {
            icon: string;
            text: string;
        };
        title: string;
        highlightText: string;
        subtitle: {
            words: string[];
        };
        description: string;
        cta: {
            primary: {
                text: string;
                icon: string;
                action: string;
                href: string;
            };
            secondary: {
                text: string;
                icon: string;
                action: string;
                href: string;
            };
        };
        stats: {
            icon: string;
            number: string;
            label: string;
        }[];
        services: {
            icon: string;
            title: string;
            subtitle: string;
            description: string;
            stats: string;
        }[];
    };
    stats: {
        title: string;
        items: {
            number: string;
            label: string;
            description?: string;
        }[];
    };
    theme: {
        default: 'light' | 'dark' | 'auto';
        fonts: {
            primary: string;
            secondary: string;
            fallback: string[];
        };
        colors: {
            primary: string;
            secondary: string;
            accent: string;
        };
    };
}

export const cmsData: CMSData = {
    site: {
        name: "Dimensionless Studios",
        tagline: "Creative Art & Tech Platform",
        description: "Your one-stop destination for art services, tech solutions, and creative innovations. From tattoos to AI-powered design tools."
    },
    navigation: {
        brand: {
            name: "Dimensionless Studios",
            link: "/",
            logo: {
                light: "/logo-black.png",
                dark: "/logo-white.png"
            }
        },
        menu: [
            {
                label: "Home",
                type: "link",
                link: "/"
            },
            {
                label: "Artverse",
                type: "dropdown",
                items: [
                    {
                        name: "Curated Art",
                        link: "/curated-art"
                    },
                    {
                        name: "Leasing & Sales",
                        link: "/leasing-sales"
                    },
                    {
                        name: "NFT Gallery",
                        link: "/nft-gallery"
                    },
                    {
                        name: "Featured Artists",
                        link: "/featured-artists"
                    }
                ]
            },
            {
                label: "Techverse",
                type: "dropdown",
                items: [
                    {
                        name: "Web3 Solutions",
                        link: "/web3-solutions"
                    },
                    {
                        name: "AI / AR / XR Projects",
                        link: "/ai-ar-xr"
                    },
                    {
                        name: "Smart Contract Development",
                        link: "/smart-contracts"
                    },
                    {
                        name: "Immersive Experiences",
                        link: "/immersive-experiences"
                    }
                ]
            },
            {
                label: "Community",
                type: "dropdown",
                items: [
                    {
                        name: "Join the DAO",
                        link: "/dao"
                    },
                    {
                        name: "Events & Workshops",
                        link: "/events"
                    },
                    {
                        name: "Discord / Whatsapp",
                        link: "/discord-whatsapp"
                    },
                    {
                        name: "Collabs",
                        link: "/collabs"
                    }
                ]
            },
            {
                label: "Wallet",
                type: "dropdown",
                items: [
                    {
                        name: "Token Utility",
                        link: "/token-utility"
                    },
                    {
                        name: "Roadmap",
                        link: "/roadmap"
                    },
                    {
                        name: "Whitepaper",
                        link: "/whitepaper"
                    },
                    {
                        name: "Buy / Stake",
                        link: "/buy-stake"
                    }
                ]
            }
        ],
        additionalLinks: [],
        cta: {
            label: "Wallet",
            action: "open_wallet"
        }
    },
    hero: {
        badge: {
            icon: "IconStar",
            text: "India's Premier Creative Destination"
        },
        title: "Where Art Transcends",
        highlightText: "All Boundaries",
        subtitle: {
            words: ["Experience", "Learn", "Transform"]
        },
        description: "Transform your world through professional tattoos, comprehensive art education, and curated artwork. Experience India's premier creative destination where technology meets artistry.",
        cta: {
            primary: {
                text: "Explore Our Creative Universe",
                icon: "IconArrowRight",
                action: "explore_services",
                href: "/services"
            },
            secondary: {
                text: "Book Studio Visit",
                icon: "IconCalendar",
                action: "book_visit",
                href: "/contact"
            }
        },
        stats: [
            {
                icon: "IconUsers",
                number: "800+",
                label: "Happy Clients"
            },
            {
                icon: "IconTrendingUp",
                number: "12+",
                label: "Years Experience"
            },
            {
                icon: "IconStar",
                number: "4.9",
                label: "Client Rating"
            }
        ],
        services: [
            {
                icon: "IconBrush",
                title: "Professional Tattoo Artistry",
                subtitle: "12+ years of masterful expertise",
                description: "Custom designs & consultations",
                stats: "500+ Happy Clients"
            },
            {
                icon: "IconBook",
                title: "Art Classes for All Ages",
                subtitle: "Nurturing creativity since 2021",
                description: "Kids & adults, online & offline",
                stats: "200+ Students Trained"
            },
            {
                icon: "IconPalette",
                title: "Premium Art Leasing",
                subtitle: "Transform spaces with curated collections",
                description: "Flexible rental for homes & offices",
                stats: "100+ Artworks Available"
            }
        ]
    },
    stats: {
        title: "Our Creative Impact",
        items: [
            {
                number: "500+",
                label: "Projects Completed",
                description: "Successfully delivered creative and tech solutions"
            },
            {
                number: "100+",
                label: "Happy Clients",
                description: "Satisfied customers across various industries"
            },
            {
                number: "50+",
                label: "Art Pieces Created",
                description: "Original artworks and custom installations"
            },
            {
                number: "25+",
                label: "Tech Solutions",
                description: "Innovative digital products and services"
            }
        ]
    },
    theme: {
        default: "auto",
        fonts: {
            primary: "SF Pro Display",
            secondary: "SF Pro Text",
            fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"]
        },
        colors: {
            primary: "#000000",
            secondary: "#ffffff",
            accent: "#667eea"
        }
    }
}; 