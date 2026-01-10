'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { IconBook, IconChevronRight, IconSearch, IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import './docs.css';

export default function AdminDocsPage() {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');

    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: '🚀',
            content: `
                <h2>Getting Started</h2>
                <p>Welcome to the Dimensionless Admin Portal. This guide will help you manage all aspects of the platform efficiently.</p>
                
                <h3>Accessing the Admin Portal</h3>
                <ul>
                    <li>You must have an admin role assigned to your account</li>
                    <li>Navigate to <code>/admin</code> after logging in</li>
                    <li>If you don't have admin access, contact the system administrator</li>
                </ul>

                <h3>Admin Dashboard</h3>
                <p>The admin dashboard is your central hub for managing all aspects of the Dimensionless platform. Access all management sections from the left sidebar.</p>
            `
        },
        {
            id: 'user-management',
            title: 'User Management',
            icon: '👥',
            content: `
                <h2>User Management</h2>
                <p><strong>Location:</strong> <code>/admin/users</code></p>

                <h3>View All Users</h3>
                <ul>
                    <li>See a complete list of all registered users</li>
                    <li>View user details: name, email, role, registration date</li>
                    <li>Search and filter users</li>
                </ul>

                <h3>User Actions</h3>
                <ul>
                    <li><strong>Edit User:</strong> Update user information</li>
                    <li><strong>Change Role:</strong> Assign admin or user roles</li>
                    <li><strong>View Activity:</strong> See user's booking and order history</li>
                    <li><strong>Manage Status:</strong> Activate or deactivate user accounts</li>
                </ul>

                <div class="tip-box">
                    <strong>💡 Best Practice:</strong> Only assign admin roles to trusted personnel and regularly review user accounts for suspicious activity.
                </div>
            `
        },
        {
            id: 'content-management',
            title: 'Content Management',
            icon: '📝',
            content: `
                <h2>Content Management</h2>

                <h3>Categories Management</h3>
                <p><strong>Location:</strong> <code>/admin/categories</code></p>

                <h4>Adding a New Category</h4>
                <ol>
                    <li>Click "Add Category" button</li>
                    <li>Enter category name and type (art, tattoo, piercing, event, class)</li>
                    <li>Set display order</li>
                    <li>Click "Save"</li>
                </ol>

                <h3>CMS (Content Management System)</h3>
                <p><strong>Location:</strong> <code>/admin/cms</code></p>

                <h4>Managing Homepage Content</h4>
                <ul>
                    <li><strong>Hero Section:</strong> Update main banner text and images</li>
                    <li><strong>Featured Content:</strong> Manage featured artworks, classes, and events</li>
                    <li><strong>Announcements:</strong> Create and edit platform announcements</li>
                </ul>

                <div class="warning-box">
                    <strong>⚠️ Important:</strong> Use high-quality images (minimum 1920x1080 for banners) and keep text concise and engaging.
                </div>
            `
        },
        {
            id: 'art-leasing',
            title: 'Art Sell / Lease',
            icon: '🖼️',
            content: `
                <h2>Art Sell / Lease Management</h2>
                <p><strong>Location:</strong> <code>/admin/leasing</code></p>

                <h3>Adding New Artwork</h3>
                <ol>
                    <li>Click "Add Artwork" button</li>
                    <li>Upload high-quality image</li>
                    <li>Enter details:
                        <ul>
                            <li>Title</li>
                            <li>Artist name</li>
                            <li>Description</li>
                            <li>Lease price (monthly)</li>
                            <li>Purchase price (optional)</li>
                            <li>Dimensions</li>
                            <li>Category</li>
                        </ul>
                    </li>
                    <li>Set availability status</li>
                    <li>Click "Save"</li>
                </ol>

                <h3>Order Management</h3>
                <ul>
                    <li><strong>View Orders:</strong> See all leasing orders</li>
                    <li><strong>Order Status:</strong> Track pending, active, completed, cancelled orders</li>
                    <li><strong>Customer Details:</strong> View customer information</li>
                    <li><strong>Payment Tracking:</strong> Monitor payment status</li>
                </ul>
            `
        },
        {
            id: 'tattoo-management',
            title: 'Tattoo Studio',
            icon: '🎨',
            content: `
                <h2>Tattoo Studio Management</h2>

                <h3>Tattoo Designs</h3>
                <p><strong>Location:</strong> <code>/admin/tattoos</code></p>

                <h4>Adding Tattoo Designs</h4>
                <ol>
                    <li>Click "Add Design" button</li>
                    <li>Fill in design details:
                        <ul>
                            <li><strong>Name:</strong> Design title</li>
                            <li><strong>Description:</strong> Detailed description</li>
                            <li><strong>Category:</strong> Select from dropdown</li>
                            <li><strong>Base Price:</strong> Starting price in ₹</li>
                            <li><strong>Estimated Duration:</strong> Time in minutes</li>
                            <li><strong>Image:</strong> Upload design image</li>
                        </ul>
                    </li>
                    <li>Set status (Active/Inactive)</li>
                    <li>Click "Save"</li>
                </ol>

                <h3>Tattoo Slots Management</h3>
                <p><strong>Location:</strong> <code>/admin/tattoo-slots</code></p>

                <h4>Creating Appointment Slots</h4>
                <ol>
                    <li>Click "Add Slot" button</li>
                    <li>Select date and time range</li>
                    <li>Set max bookings (concurrent appointments)</li>
                    <li>Set status (Available/Unavailable)</li>
                    <li>Click "Save"</li>
                </ol>
            `
        },
        {
            id: 'piercing-management',
            title: 'Piercing Management',
            icon: '💎',
            content: `
                <h2>Piercing Management</h2>
                <p><strong>Location:</strong> <code>/admin/piercings</code></p>

                <p>Piercing management works identically to Tattoo Management with the same features:</p>

                <ul>
                    <li>Design name and description</li>
                    <li>Category selection</li>
                    <li>Base price setting</li>
                    <li>Estimated duration</li>
                    <li>Design image upload</li>
                    <li>Active/Inactive status</li>
                </ul>

                <h3>Piercing Slots</h3>
                <p><strong>Location:</strong> <code>/admin/piercing-slots</code></p>
                <p>Same functionality as Tattoo Slots for appointment scheduling.</p>
            `
        },
        {
            id: 'events-classes',
            title: 'Events & Classes',
            icon: '📅',
            content: `
                <h2>Events & Classes Management</h2>

                <h3>Events Management</h3>
                <p><strong>Location:</strong> <code>/admin/events</code></p>

                <h4>Creating Events</h4>
                <ol>
                    <li>Click "Create Event" button</li>
                    <li>Enter event details (title, description, type)</li>
                    <li>Upload event banner</li>
                    <li>Set start and end date/time</li>
                    <li>Enter location and capacity</li>
                    <li>Set registration fee (0 for free)</li>
                    <li>Set status (Draft/Published/Cancelled)</li>
                    <li>Click "Save"</li>
                </ol>

                <h3>Classes Management</h3>
                <p><strong>Location:</strong> <code>/admin/classes</code></p>

                <h4>Creating Art Classes</h4>
                <ol>
                    <li>Click "Create Class" button</li>
                    <li>Fill in class information</li>
                    <li>Set pricing type (Free/One-time/Subscription)</li>
                    <li>Add sessions with dates and meeting links</li>
                    <li>Click "Save"</li>
                </ol>
            `
        },
        {
            id: 'token-management',
            title: 'Token Management',
            icon: '🪙',
            content: `
                <h2>Token Management</h2>

                <h3>Dimen Tokens</h3>
                <p><strong>Location:</strong> <code>/admin/tokens</code></p>

                <ul>
                    <li><strong>View Total Supply:</strong> See total tokens issued</li>
                    <li><strong>Track Investments:</strong> Monitor user investments</li>
                    <li><strong>Investment History:</strong> View all transactions</li>
                    <li><strong>User Holdings:</strong> See token distribution</li>
                </ul>

                <h3>Blue Chip Management</h3>
                <p><strong>Location:</strong> <code>/admin/blue-chip</code></p>

                <ul>
                    <li>Add premium artworks to blue chip collection</li>
                    <li>Set investment tiers</li>
                    <li>Track returns and performance</li>
                    <li>Manage investor allocations</li>
                </ul>

                <h3>Redemptions</h3>
                <p><strong>Location:</strong> <code>/admin/redemptions</code></p>

                <ul>
                    <li>View redemption requests</li>
                    <li>Approve/reject requests</li>
                    <li>Track redemption history</li>
                    <li>Process payouts</li>
                </ul>
            `
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            content: `
                <h2>Platform Settings</h2>
                <p><strong>Location:</strong> <code>/admin/settings</code></p>

                <h3>General Settings</h3>
                <ul>
                    <li><strong>Platform Name:</strong> Update branding</li>
                    <li><strong>Contact Information:</strong> Support email and phone</li>
                    <li><strong>Social Media:</strong> Links to social profiles</li>
                    <li><strong>Timezone:</strong> Set default timezone</li>
                </ul>

                <h3>Payment Settings</h3>
                <ul>
                    <li><strong>Razorpay Configuration:</strong> API keys</li>
                    <li><strong>Payment Methods:</strong> Enable/disable options</li>
                    <li><strong>Currency:</strong> Set default currency</li>
                </ul>

                <h3>Email Settings</h3>
                <ul>
                    <li><strong>SMTP Configuration:</strong> Email server settings</li>
                    <li><strong>Email Templates:</strong> Customize notification emails</li>
                    <li><strong>Sender Information:</strong> From name and email</li>
                </ul>

                <div class="success-box">
                    <strong>✅ Security Tip:</strong> Change default admin password immediately and use strong, unique passwords.
                </div>
            `
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: '🔧',
            content: `
                <h2>Troubleshooting</h2>

                <h3>Common Issues</h3>

                <h4>Cannot Upload Images</h4>
                <p><strong>Solution:</strong></p>
                <ul>
                    <li>Check file size (max 5MB) and format (JPG, PNG, WebP)</li>
                    <li>Ensure stable internet connection</li>
                    <li>Try different browser if issue persists</li>
                </ul>

                <h4>Bookings Not Showing</h4>
                <p><strong>Solution:</strong></p>
                <ul>
                    <li>Check date filters</li>
                    <li>Verify booking status filter</li>
                    <li>Refresh the page</li>
                    <li>Clear browser cache</li>
                </ul>

                <h4>Slot Creation Fails</h4>
                <p><strong>Solution:</strong></p>
                <ul>
                    <li>Ensure no overlapping slots</li>
                    <li>Check that end time is after start time</li>
                    <li>Verify date is in the future</li>
                </ul>

                <h4>Payment Issues</h4>
                <p><strong>Solution:</strong></p>
                <ul>
                    <li>Verify Razorpay API keys</li>
                    <li>Check payment gateway status</li>
                    <li>Review transaction logs</li>
                </ul>

                <h3>Getting Help</h3>
                <p>If you encounter issues not covered here:</p>
                <ol>
                    <li>Check the browser console for error messages</li>
                    <li>Contact technical support at <strong>support@dimensionless.in</strong></li>
                    <li>Provide detailed description of the issue</li>
                    <li>Include screenshots if possible</li>
                </ol>
            `
        }
    ];

    const filteredSections = sections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="admin-docs-page-new">
                {/* Header */}
                <div className="docs-header-new">
                    <div className="docs-header-content-new">
                        <div className="docs-header-left">
                            <IconBook size={40} />
                            <div>
                                <h1>Admin Documentation</h1>
                                <p>Complete guide to managing Dimensionless</p>
                            </div>
                        </div>
                        <Link href="/admin" className="back-to-admin">
                            <IconHome size={20} />
                            Back to Admin
                        </Link>
                    </div>
                </div>

                {/* Main Container */}
                <div className="docs-main-container">
                    {/* Sidebar Navigation */}
                    <aside className="docs-sidebar-new">
                        <div className="docs-search">
                            <IconSearch size={20} />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <nav className="docs-nav">
                            {filteredSections.map((section) => (
                                <button
                                    key={section.id}
                                    className={`docs-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <span className="nav-icon">{section.icon}</span>
                                    <span className="nav-title">{section.title}</span>
                                    <IconChevronRight size={16} className="nav-arrow" />
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="docs-content-new">
                        {sections.find(s => s.id === activeSection) && (
                            <div
                                className="docs-content-inner"
                                dangerouslySetInnerHTML={{
                                    __html: sections.find(s => s.id === activeSection)?.content || ''
                                }}
                            />
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}
