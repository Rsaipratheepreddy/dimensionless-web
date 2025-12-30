# Dimensionless Admin Portal Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [User Management](#user-management)
4. [Content Management](#content-management)
5. [Art Leasing Management](#art-leasing-management)
6. [Tattoo Studio Management](#tattoo-studio-management)
7. [Piercing Management](#piercing-management)
8. [Events & Classes](#events--classes)
9. [Token Management](#token-management)
10. [Settings](#settings)

---

## Getting Started

### Accessing the Admin Portal

1. **Login Requirements**
   - You must have an admin role assigned to your account
   - Navigate to `/admin` after logging in
   - If you don't have admin access, contact the system administrator

2. **Admin Dashboard**
   - The admin dashboard is your central hub for managing all aspects of the Dimensionless platform
   - Access all management sections from the left sidebar
   - Quick stats and overview cards are displayed on the main dashboard

---

## Dashboard Overview

The admin dashboard (`/admin`) provides:

- **Quick Statistics**: View total users, active bookings, revenue, and more
- **Recent Activity**: Monitor latest user registrations, bookings, and orders
- **Navigation**: Access all admin sections from the sidebar

### Admin Sidebar Sections

- **Admin Portal**: Main dashboard
- **Platform Settings**: General configuration
- **Leasing Management**: Art leasing orders and inventory
- **Tattoo Management**: Tattoo designs and bookings
- **Tattoo Slots**: Appointment scheduling
- **Piercing Management**: Piercing designs and bookings
- **Piercing Slots**: Piercing appointment scheduling
- **User Management**: User accounts and roles
- **Categories**: Content categorization
- **CMS**: Content management system
- **Events**: Event creation and management
- **Classes**: Art class management
- **Bookings**: View all bookings
- **Tokens**: Dimen token management
- **Blue Chip**: Blue chip art management
- **Redemptions**: Token redemption tracking

---

## User Management

**Location**: `/admin/users`

### Features

#### View All Users
- See a complete list of all registered users
- View user details: name, email, role, registration date
- Search and filter users

#### User Actions
- **Edit User**: Update user information
- **Change Role**: Assign admin or user roles
- **View Activity**: See user's booking and order history
- **Manage Status**: Activate or deactivate user accounts

### Best Practices
- Regularly review user accounts for suspicious activity
- Only assign admin roles to trusted personnel
- Keep user data up-to-date and accurate

---

## Content Management

### Categories Management
**Location**: `/admin/categories`

#### Managing Categories
1. **Add New Category**
   - Click "Add Category" button
   - Enter category name and type (art, tattoo, piercing, event, class)
   - Set display order
   - Click "Save"

2. **Edit Category**
   - Click edit icon on any category
   - Update details
   - Save changes

3. **Delete Category**
   - Click delete icon
   - Confirm deletion
   - Note: Cannot delete categories with associated content

### CMS (Content Management System)
**Location**: `/admin/cms`

#### Managing Homepage Content
- **Hero Section**: Update main banner text and images
- **Featured Content**: Manage featured artworks, classes, and events
- **Announcements**: Create and edit platform announcements

#### Content Guidelines
- Use high-quality images (minimum 1920x1080 for banners)
- Keep text concise and engaging
- Update content regularly to keep the platform fresh

---

## Art Leasing Management

**Location**: `/admin/leasing`

### Overview
Manage art leasing inventory, orders, and customer requests.

### Features

#### Artwork Management
1. **Add New Artwork**
   - Click "Add Artwork" button
   - Upload high-quality image
   - Enter details:
     - Title
     - Artist name
     - Description
     - Lease price (monthly)
     - Purchase price (optional)
     - Dimensions
     - Category
   - Set availability status
   - Click "Save"

2. **Edit Artwork**
   - Click on artwork card
   - Update any field
   - Save changes

3. **Manage Availability**
   - Toggle "Available" status
   - Mark as "Leased" when rented
   - Update when returned

#### Order Management
- **View Orders**: See all leasing orders (desktop: table view, mobile: card view)
- **Order Status**: Track pending, active, completed, cancelled orders
- **Customer Details**: View customer information and contact details
- **Payment Tracking**: Monitor payment status and history

#### Artist Upload Section
- Upload multiple artworks at once
- Bulk import from CSV
- Set default pricing and terms

### Leasing Workflow
1. Customer browses and selects artwork
2. Order appears in admin panel as "Pending"
3. Admin reviews and approves order
4. Status changes to "Active" when artwork is delivered
5. Track lease duration and renewal
6. Mark as "Completed" when returned

---

## Tattoo Studio Management

### Tattoo Designs
**Location**: `/admin/tattoos`

#### Adding Tattoo Designs
1. Click "Add Design" button
2. Fill in design details:
   - **Name**: Design title
   - **Description**: Detailed description
   - **Category**: Select from dropdown
   - **Base Price**: Starting price in ₹
   - **Estimated Duration**: Time in minutes
   - **Image**: Upload design image
3. Set status (Active/Inactive)
4. Click "Save"

#### Managing Designs
- **Edit**: Click edit icon to modify design
- **Delete**: Remove designs (only if no bookings exist)
- **Toggle Status**: Activate/deactivate designs
- **View Bookings**: See all bookings for a specific design

### Tattoo Slots Management
**Location**: `/admin/tattoo-slots`

#### Creating Appointment Slots
1. Click "Add Slot" button
2. Configure slot:
   - **Date**: Select date
   - **Start Time**: Appointment start
   - **End Time**: Appointment end
   - **Max Bookings**: Number of concurrent appointments
   - **Status**: Available/Unavailable
3. Click "Save"

#### Slot Management
- **Bulk Create**: Create multiple slots for a date range
- **Edit Slots**: Modify time or capacity
- **Cancel Slots**: Mark as unavailable
- **View Bookings**: See who booked each slot

### Tattoo Bookings
**Location**: `/admin/bookings` (filter by type: tattoo)

#### Managing Bookings
- View all tattoo bookings
- Filter by status: Pending, Confirmed, Completed, Cancelled
- See customer details and custom notes
- View reference images uploaded by customers
- Update booking status
- Contact customers

---

## Piercing Management

### Piercing Designs
**Location**: `/admin/piercings`

Works identically to Tattoo Management with the following fields:
- Design name and description
- Category
- Base price
- Estimated duration
- Design image
- Active/Inactive status

### Piercing Slots
**Location**: `/admin/piercing-slots`

Same functionality as Tattoo Slots:
- Create appointment slots
- Set date and time ranges
- Configure capacity
- Manage availability

---

## Events & Classes

### Events Management
**Location**: `/admin/events`

#### Creating Events
1. Click "Create Event" button
2. Enter event details:
   - **Title**: Event name
   - **Description**: Full description
   - **Type**: Event or Competition
   - **Category**: Select category
   - **Image**: Upload event banner
   - **Start Date & Time**
   - **End Date & Time**
   - **Location**: Venue details
   - **Price**: Registration fee (0 for free)
   - **Max Capacity**: Attendee limit
3. Set status: Draft, Published, Cancelled
4. Click "Save"

#### Managing Events
- **Edit**: Update event details
- **View Registrations**: See all registered participants
- **Export Attendees**: Download participant list
- **Cancel Event**: Cancel and notify participants
- **Duplicate**: Create similar event quickly

### Classes Management
**Location**: `/admin/classes`

#### Creating Art Classes
1. Click "Create Class" button
2. Fill in class information:
   - **Title**: Class name
   - **Description**: What students will learn
   - **Category**: Art type
   - **Thumbnail**: Class image
   - **Pricing Type**: Free, One-time, Subscription
   - **Price**: Amount (if paid)
   - **Subscription Duration**: Days (if subscription)
3. Add sessions:
   - Session title
   - Date and time
   - Session link (Zoom, Google Meet, etc.)
4. Click "Save"

#### Managing Classes
- **Edit Class**: Update details and sessions
- **View Enrollments**: See enrolled students
- **Manage Sessions**: Add/edit/delete sessions
- **Session Links**: Update meeting links
- **View Attendees**: `/admin/classes/[id]/attendees`

---

## Token Management

### Dimen Tokens
**Location**: `/admin/tokens`

#### Token Operations
- **View Total Supply**: See total tokens issued
- **Track Investments**: Monitor user investments
- **Investment History**: View all transactions
- **User Holdings**: See token distribution

### Blue Chip Management
**Location**: `/admin/blue-chip`

#### Managing Blue Chip Art
- Add premium artworks to blue chip collection
- Set investment tiers
- Track returns and performance
- Manage investor allocations

### Redemptions
**Location**: `/admin/redemptions`

#### Processing Redemptions
- View redemption requests
- Approve/reject requests
- Track redemption history
- Process payouts

---

## Settings

**Location**: `/admin/settings`

### Platform Configuration

#### General Settings
- **Platform Name**: Update branding
- **Contact Information**: Support email and phone
- **Social Media**: Links to social profiles
- **Timezone**: Set default timezone

#### Payment Settings
- **Razorpay Configuration**: API keys
- **Payment Methods**: Enable/disable options
- **Currency**: Set default currency

#### Email Settings
- **SMTP Configuration**: Email server settings
- **Email Templates**: Customize notification emails
- **Sender Information**: From name and email

#### Notification Settings
- **Push Notifications**: Enable/disable
- **Email Notifications**: Configure triggers
- **SMS Notifications**: Set up SMS alerts

---

## Best Practices

### Security
- ✅ Change default admin password immediately
- ✅ Use strong, unique passwords
- ✅ Enable two-factor authentication if available
- ✅ Regularly review admin user list
- ✅ Log out when finished

### Content Management
- ✅ Use high-quality images (minimum 1200px width)
- ✅ Optimize images before uploading
- ✅ Write clear, concise descriptions
- ✅ Keep pricing consistent and up-to-date
- ✅ Regularly update content to keep platform fresh

### Customer Service
- ✅ Respond to bookings within 24 hours
- ✅ Keep customers informed of status changes
- ✅ Maintain professional communication
- ✅ Handle cancellations promptly
- ✅ Follow up after completed services

### Data Management
- ✅ Regularly backup data
- ✅ Archive old bookings and orders
- ✅ Clean up inactive users periodically
- ✅ Monitor system performance
- ✅ Keep software updated

---

## Troubleshooting

### Common Issues

#### Cannot Upload Images
- **Solution**: Check file size (max 5MB) and format (JPG, PNG, WebP)
- Ensure stable internet connection
- Try different browser if issue persists

#### Bookings Not Showing
- **Solution**: Check date filters
- Verify booking status filter
- Refresh the page
- Clear browser cache

#### Slot Creation Fails
- **Solution**: Ensure no overlapping slots
- Check that end time is after start time
- Verify date is in the future

#### Payment Issues
- **Solution**: Verify Razorpay API keys
- Check payment gateway status
- Review transaction logs

### Getting Help

If you encounter issues not covered in this documentation:

1. Check the browser console for error messages
2. Contact technical support at support@dimensionless.in
3. Provide detailed description of the issue
4. Include screenshots if possible

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save (in edit forms)
- `Esc`: Close modals
- `Ctrl/Cmd + F`: Search within page

### Status Indicators
- 🟢 **Active/Published**: Live and visible to users
- 🟡 **Pending**: Awaiting approval or action
- 🔴 **Cancelled/Inactive**: Not visible to users
- ⚪ **Draft**: Work in progress

### Mobile vs Desktop Views
- **Desktop**: Full table views with all columns
- **Mobile**: Card-based views for better readability
- Responsive design adapts automatically

---

## Support

For additional assistance:
- **Email**: admin@dimensionless.in
- **Phone**: +91-XXXXXXXXXX
- **Documentation**: Check this guide first
- **Technical Issues**: Contact development team

---

*Last Updated: December 30, 2024*
*Version: 1.0*
