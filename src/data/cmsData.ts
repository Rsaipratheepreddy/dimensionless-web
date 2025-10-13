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
                label: "Art Services",
                type: "dropdown",
                tabs: [
                    {
                        id: "art-services",
                        label: "Services",
                        sections: [
                            {
                                title: "ART SERVICES",
                                items: [
                                    {
                                        name: "Tattoos",
                                        icon: "IconBrush",
                                        description: "Professional tattoo artistry and custom designs with various sizes and styles",
                                        link: "/tattoos"
                                    },
                                    {
                                        name: "Piercing",
                                        icon: "IconDiamond",
                                        description: "Safe and professional body piercing services with premium jewelry",
                                        link: "/piercing"
                                    },
                                    {
                                        name: "Art Classes",
                                        icon: "IconPalette",
                                        description: "Learn various art techniques from professional artists and instructors",
                                        link: "/art-classes"
                                    },
                                    {
                                        name: "Tattoo Trainings",
                                        icon: "IconSchool",
                                        description: "Comprehensive tattoo artist training programs and certifications",
                                        link: "/tattoo-training"
                                    },
                                    {
                                        name: "Live Art Sessions",
                                        icon: "IconVideo",
                                        description: "Interactive live art performances and real-time workshops",
                                        link: "/live-art"
                                    },
                                    {
                                        name: "Wall Painting",
                                        icon: "IconWall",
                                        description: "Custom murals and large-scale wall art installations",
                                        link: "/wall-painting"
                                    },
                                    {
                                        name: "Custom Art Installations",
                                        icon: "IconBuildingStore",
                                        description: "Bespoke art installations for commercial and residential spaces",
                                        link: "/custom-installations"
                                    },
                                    {
                                        name: "Corporate Events",
                                        icon: "IconBuilding",
                                        description: "Art-focused corporate events and team building activities",
                                        link: "/corporate-events"
                                    },
                                    {
                                        name: "Nail Art",
                                        icon: "IconHandFinger",
                                        description: "Professional nail art services with creative designs",
                                        link: "/nail-art"
                                    },
                                    {
                                        name: "Art Therapy",
                                        icon: "IconHeart",
                                        description: "Therapeutic art sessions for mental health and wellness",
                                        link: "/art-therapy"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "art-products",
                        label: "Products",
                        sections: [
                            {
                                title: "ART PRODUCTS",
                                items: [
                                    {
                                        name: "Canvas Artworks",
                                        icon: "IconPhoto",
                                        description: "Original paintings and canvas art pieces in various sizes and styles",
                                        link: "/canvas"
                                    },
                                    {
                                        name: "Merchandise",
                                        icon: "IconShirt",
                                        description: "Custom branded merchandise, apparel, and promotional items",
                                        link: "/merchandise"
                                    },
                                    {
                                        name: "Tattoo Kits & Supply",
                                        icon: "IconToolsKitchen2",
                                        description: "Professional tattoo equipment, machines, and art supplies",
                                        link: "/tattoo-kits"
                                    },
                                    {
                                        name: "Customised Wall Art",
                                        icon: "IconFrame",
                                        description: "Personalized wall decorations, frames, and home decor",
                                        link: "/wall-art"
                                    },
                                    {
                                        name: "NFT Art Collections",
                                        icon: "IconCoin",
                                        description: "Digital art collections and blockchain-based artwork",
                                        link: "/nft-collections"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                label: "Tech Services",
                type: "dropdown",
                tabs: [
                    {
                        id: "tech-services",
                        label: "Services",
                        sections: [
                            {
                                title: "TECH SERVICES",
                                items: [
                                    {
                                        name: "Branding",
                                        icon: "IconBrandApple",
                                        description: "Complete brand identity design and strategic brand development",
                                        link: "/branding"
                                    },
                                    {
                                        name: "Graphic Designing",
                                        icon: "IconPencil",
                                        description: "Visual design solutions for digital and print media",
                                        link: "/graphic-design"
                                    },
                                    {
                                        name: "AI Powered Design Tools",
                                        icon: "IconRobot",
                                        description: "Cutting-edge AI tools for automated design and creativity",
                                        link: "/ai-design-tools"
                                    },
                                    {
                                        name: "Tech Tools",
                                        icon: "IconTool",
                                        description: "Custom software tools and automation solutions",
                                        link: "/tech-tools"
                                    },
                                    {
                                        name: "AR VR Experiences",
                                        icon: "IconDeviceDesktop",
                                        description: "Immersive augmented and virtual reality experiences",
                                        link: "/ar-vr"
                                    },
                                    {
                                        name: "Creative Tech Consulting",
                                        icon: "IconBulb",
                                        description: "Strategic technology consulting for creative industries",
                                        link: "/tech-consulting"
                                    },
                                    {
                                        name: "Website & Ecommerce Development",
                                        icon: "IconWorld",
                                        description: "Full-stack web development and e-commerce solutions",
                                        link: "/web-development"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "tech-products",
                        label: "Products",
                        sections: [
                            {
                                title: "TECH PRODUCTS",
                                items: [
                                    {
                                        name: "AI Art Generation Software",
                                        icon: "IconCpu",
                                        description: "Advanced AI software for generating unique artistic content",
                                        link: "/ai-software"
                                    },
                                    {
                                        name: "Digital Marketplace",
                                        icon: "IconShoppingCart",
                                        description: "Platform for buying and selling digital art and creative assets",
                                        link: "/marketplace"
                                    },
                                    {
                                        name: "SM-ART Frames",
                                        icon: "IconDeviceTablet",
                                        description: "Smart digital frames with interactive art display features",
                                        link: "/smart-frames"
                                    },
                                    {
                                        name: "Creative-Tech Mobile Apps",
                                        icon: "IconDeviceMobile",
                                        description: "Mobile applications for creative professionals and artists",
                                        link: "/mobile-apps"
                                    },
                                    {
                                        name: "Design Templates/Toolkits",
                                        icon: "IconTemplate",
                                        description: "Professional design templates and comprehensive toolkits",
                                        link: "/design-templates"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                label: "Pricing",
                type: "link",
                link: "/pricing"
            },
            {
                label: "About",
                type: "link",
                link: "/about"
            }
        ],
        additionalLinks: [],
        cta: {
            label: "Contact Us",
            action: "open_contact"
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