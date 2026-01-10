# E-Commerce Multi-Seller Platform - Design PRD

**Version:** 1.0  
**Date:** January 10, 2026  
**Inspired by:** Shopee.co.th

---

## 1. Product Overview

**What:** Multi-seller e-commerce marketplace for Indian small businesses and consumers  
**Goal:** Enable seamless buying and selling with intuitive product discovery, promotions, and checkout  
**Users:** Customers (Buyers), Sellers, Platform Admin

---

## 2. Key User Flows

### 2.1 Customer Journey
```
Homepage → Browse/Search → Product Page → Add to Cart → Checkout → Order Tracking → Review
```

### 2.2 Seller Journey
```
Register → Verify → Add Products → Manage Orders → Create Promotions → Get Paid
```

### 2.3 Admin Journey
```
Approve Sellers → Manage Categories → Create Campaigns → Monitor Platform → Reports
```

---

## 3. Homepage Design

### Header
- **Logo** (left)
- **Search Bar** (center) - with auto-suggestions
- **Categories Menu** (dropdown mega-menu)
- **Icons:** Cart (with count), Account, Notifications

### Hero Section
- **Main Carousel Banner** (5-7 rotating slides, auto-play 5s)
- **Category Quick Links** (8-12 circular icons below banner)

### Content Sections (Vertical Scroll)

**1. Flash Sale**
- Countdown timer (HH:MM:SS)
- Horizontal product scroll (6-8 products)
- Each product shows: Image, Discount badge, Original price (strikethrough), Sale price, Progress bar (X% sold)
- "View All" button

**2. Categories to Explore**
- Large category cards (4 per row)
- Category image + name + product count

**3. Best Sellers**
- Product grid with "Bestseller" badge
- Star rating + review count + sold count

**4. Deals of the Day**
- Time-limited offers
- Special pricing highlights

**5. For You** (Personalized)
- AI recommendations
- Based on browsing history

### Footer
- Company info, Help center, Social media
- Payment partner logos
- App download buttons

---

## 4. Category & Listing Page

### Layout: Sidebar + Main Content

**Left Sidebar (Filters)**

**Collapsible Sections:**

1. **Category Tree** (nested, expandable)
2. **Price Range** (slider + manual input)
3. **Brand** (multi-select checkboxes with search)
4. **Rating** (4★ & above, 3★ & above, etc.)
5. **Discount** (50%+, 40%+, 30%+, 20%+, 10%+)
6. **Delivery Options**
   - Free shipping
   - Same-day delivery
   - Cash on Delivery
7. **Seller Type**
   - Verified sellers
   - Top-rated sellers
8. **Product Attributes** (dynamic based on category)
   - For Electronics: RAM, Storage, Screen Size
   - For Fashion: Size, Color, Material

**Active Filters:** Show as removable chips at top

**Main Content**

**Top Bar:**
- Breadcrumb: Home > Category > Sub-category
- **Sort By:** Relevance, Price (Low-High), Price (High-Low), Newest, Best Selling, Top Rated
- **View:** Grid (default) / List toggle
- Results count

**Product Grid**
- 4-5 columns (responsive)
- Infinite scroll or pagination

---

## 5. Product Card (Grid View)

### Components

**Product Image**
- Square ratio
- Hover: Show alternate image
- **Badges** (overlays):
  - "Bestseller" (gold, top-left)
  - "New" (green)
  - "-X% Off" (red)
  - "Free Shipping" (blue)
- **Wishlist heart** (top-right corner)

**Product Info**
- Product name (2 lines max, truncated)
- ⭐ Rating (1-5) + review count
- **Price:**
  - Original price (strikethrough if discount)
  - Current price (large, bold, red)
  - Discount % badge
- Seller name + "Verified" badge
- Location + Units sold (e.g., "2.5k sold")

**Hover Actions**
- "Add to Cart" button appears
- "Quick View" icon

---

## 6. Product Detail Page (PDP)

### Layout: 40% Gallery + 60% Info

**Left: Product Gallery**
- Large main image (zoomable on hover)
- 5-8 thumbnail images below (horizontal scroll)
- Video support
- 360° view (if available)
- Click for lightbox/fullscreen

**Right: Product Information**

**Section 1: Header**
- Product title (H1)
- Wishlist heart + Share icons
- ⭐ 4.5/5 | 12.5k Ratings | 1.2k Reviews (clickable)

**Section 2: Pricing**
- Original price (strikethrough)
- Current price (extra large, highlighted)
- "You Save: ₹XXX" 
- Discount % badge
- EMI options (if available)

**Section 3: Offers (Expandable)**
- Bank offers (HDFC, SBI icons)
- Coupon codes (with copy button)
- Bundle deals

**Section 4: Delivery**
- Pincode checker input
- Estimated delivery date
- Delivery options (Standard/Express/Same-day)
- Free shipping badge
- COD available
- Return policy (7/15/30 days)

**Section 5: Variants**
- Color swatches (clickable, out-of-stock greyed)
- Size buttons (XS, S, M, L, XL) + Size guide link
- Quantity selector (+/- buttons)
- Stock availability ("Only X left")

**Section 6: Action Buttons**
- **Add to Cart** (primary, large, orange/red)
- **Buy Now** (secondary)
- Add to Wishlist (outline)

**Section 7: Seller Info Card**
- Seller name + ⭐ rating
- "Verified Seller" badge
- "Chat with Seller" button
- "Visit Store" link
- Response time, products count

**Below: Tabbed Content**

**Tab 1: Description**
- Rich text description
- Key features (bullets)
- What's in the box

**Tab 2: Specifications**
- Table format
- Category-specific attributes

**Tab 3: Ratings & Reviews**
- Star distribution bar chart (5★ to 1★)
- Filter: By rating, With images, Verified purchase
- Review cards:
  - Name + verified badge
  - ⭐ rating + date
  - Review text
  - Images (thumbnail gallery)
  - Helpful votes
- "Write a Review" button (for buyers)

**Tab 4: Q&A**
- Search Q&A
- Question cards with answers
- "Ask Question" button

**Carousels Below:**
- Similar Products
- Frequently Bought Together
- Recently Viewed

---

## 7. Shopping Cart

### Layout: 70% Items + 30% Summary

**Left: Cart Items**

**Header:**
- "Shopping Cart (X items)"
- Select All checkbox
- Continue Shopping link

**Cart Items (Grouped by Seller)**
- Checkbox for selection
- Product thumbnail (clickable)
- Product name + variant details
- Price (original + discounted)
- Quantity selector (+/-)
- Subtotal
- Actions: Remove, Save for Later

**Right: Order Summary (Sticky)**

- Subtotal: ₹XXX
- Shipping: ₹XXX (or FREE)
- Discount: -₹XXX
- **Total: ₹XXX** (large, bold)
- You Save: ₹XXX (green)

**Apply Coupon:**
- Input field + Apply button
- Available coupons list (expandable)

**Proceed to Checkout** (large CTA button)

**Empty Cart State:**
- Illustration + "Your cart is empty"
- Continue Shopping button
- Recommended products

---

## 8. Checkout Flow

### Progress Steps (Top)
```
Cart → Address → Payment → Confirmation
```

**Step 1: Delivery Address**

**Saved Addresses:**
- Radio select
- Address cards (name, address, phone)
- "Deliver Here" button per card
- Edit/Remove options

**Add New Address (Modal):**
- Full name, Phone
- Pincode (auto-fill city/state)
- Address Line 1, Line 2, Landmark
- City, State
- Type: Home/Office
- Save button

**Step 2: Order Review**

- Selected address (editable)
- Products by seller (with delivery estimates)
- Delivery option selector per seller
- Gift options (wrap + message)

**Step 3: Payment**

**Payment Tabs:**
1. **UPI** (UPI ID input, QR code)
2. **Cards** (Card number, expiry, CVV, save card option)
3. **Net Banking** (Bank dropdown)
4. **COD** (if available)
5. **Wallets** (Paytm, PhonePe icons)
6. **EMI** (tenure selector, breakdown table)

**Order Summary (Right Sidebar - Sticky)**
- Items, Shipping, Discounts, Total
- **Place Order** button

**Terms Checkbox:**
- "I agree to Terms & Conditions"

### Step 4: Confirmation

**Success Screen:**
- ✓ Checkmark animation
- "Order Placed Successfully!"
- Order number (large, copyable)
- Expected delivery date
- Order summary
- Continue Shopping / View Order Details buttons

---

## 9. User Account

### Dashboard Sidebar Menu
1. Dashboard
2. My Orders
3. Wishlist
4. Addresses
5. Payment Methods
6. Notifications
7. Reviews
8. Vouchers
9. Settings
10. Logout

### My Orders

**Filter Tabs:**
- All, Pending, Shipped, Delivered, Cancelled, Returned

**Order Card:**
- Order # + Date
- Status badge (color-coded)
- Product thumbnail + name + qty
- Total amount
- Actions: Track, Invoice, Cancel, Return, Review, Buy Again

**Order Details Page:**
- Order timeline (stepper: Placed → Confirmed → Shipped → Delivered)
- Product details
- Delivery address
- Payment info
- Price breakdown
- Actions: Cancel, Return, Track, Contact Seller

### Wishlist
- Product grid
- "Add to Cart" on each
- Price drop alert toggle
- Stock status

---

## 10. Seller Dashboard

### Main Navigation
1. Dashboard (overview)
2. Products
3. Orders
4. Promotions
5. Analytics
6. Wallet
7. Settings

### Dashboard Overview

**Metric Cards:**
- Today's Sales: ₹XXX
- Pending Orders: XX
- Products Live: XX
- Wallet Balance: ₹XXX

**Charts:**
- Sales trend (line graph)
- Top products (bar chart)

**Quick Actions:**
- Add Product (prominent button)
- View Orders
- Create Promotion

### Product Management

**Product List Table:**
- Columns: Image, Name, Category, Price, Stock, Status, Sales, Actions
- Filters: All, Published, Draft, Out of Stock
- Search by name/SKU
- Bulk actions: Update stock, Delete

**Add Product Form (Single Page)**

**Sections:**
1. **Basic Info**
   - Product name
   - Category (dropdown tree)
   - Description (rich text)
   - Brand, Tags

2. **Images**
   - Drag & drop upload (max 8)
   - Main image selector
   - Image reorder

3. **Pricing**
   - Base price
   - Discount price
   - Tax rate dropdown

4. **Inventory**
   - Stock quantity
   - SKU
   - Low stock alert threshold

5. **Variants** (if applicable)
   - Add variant types (Size, Color)
   - Variant table (combinations, price, stock)

6. **Shipping**
   - Weight, Dimensions
   - Shipping charge
   - Free shipping toggle

7. **Additional**
   - Condition (New/Refurbished/Used)
   - Return eligible (Yes/No)
   - COD available

**Action Buttons:**
- Save as Draft
- Preview
- Publish

### Order Management

**Orders Table:**
- Columns: Order #, Date, Customer, Products, Amount, Status, Actions
- Filter by status, date
- Export to CSV

**Order Detail:**
- Customer info
- Products ordered
- Shipping address
- Payment status
- Actions: Confirm, Mark Shipped (add tracking), Cancel

### Promotions

**Campaign Types (Tabs):**
1. Discount Campaign
2. Flash Sale
3. Vouchers
4. Bundle Deals

**Create Campaign Form:**
- Campaign name
- Type selection
- Discount % or amount
- Applicable products (select)
- Valid from/to dates
- Usage limits

**Active Campaigns List:**
- Name, Type, Status, Dates, Usage
- Edit/Pause/Stop actions

---

## 11. Promotional Features

### Flash Sale Page

**Design:**
- Large countdown timer (hours:mins:secs)
- Hero banner
- Product grid
- "Ending Soon" section (last 2 hours)

**Flash Sale Card:**
- Bigger discount badge
- Progress bar ("X% claimed")
- Original vs Flash price
- Stock indicator
- Quick "Add to Cart"

### Voucher Center

**Tabs:**
- For You (personalized)
- All Vouchers
- Bank Offers
- Expiring Soon

**Voucher Card:**
- Voucher code (large, copy button)
- Title + description
- Discount type/amount
- Min. purchase requirement
- Expiry countdown
- "Collect" / "Use Now" buttons
- Terms (expandable)

### Loyalty Program (Optional)

**Rewards Dashboard:**
- Points balance (large display)
- Tier status (Bronze/Silver/Gold/Platinum)
- Earn points: Sign-up, Purchase, Review, Referral
- Redeem: Vouchers, Discounts, Free shipping

---

## 12. Search & Discovery

### Search Bar (Header)

**Features:**
- Placeholder: "Search products, brands..."
- Auto-suggestions (as user types):
  - Popular searches
  - Products (with thumbnail + price)
  - Categories
  - Brands
  - Recent searches (logged-in users)

### Search Results Page

**Layout:** Same as Category Page
- Filters (left sidebar)
- Sort options
- Product grid
- "Did you mean?" suggestion (for typos)
- Related searches (chips)

**No Results State:**
- "No products found"
- Search suggestions
- Popular categories
- Trending products

---

## 13. Admin Panel (Key Screens)

### Dashboard
- Total revenue, orders, sellers, customers
- Sales trend graph
- Top sellers, top products
- Pending approvals

### Seller Management
- Seller list (Pending/Approved/Suspended)
- Approve/Reject applications
- View seller details
- Suspend/Activate sellers

### Product Management
- All products across platform
- Approve/Reject products
- Featured product selection
- Remove policy violations

### Category Management
- Category tree (create/edit/delete)
- Drag-drop to reorder
- Set category images
- Define attributes per category

### Banner Management
- Homepage carousel banners
- Category banners
- Promotional banners
- Upload image, set link, schedule (start/end dates)
- Drag to reorder

### Campaign Management
- Create platform-wide sales
- Flash sales setup
- Voucher generation
- Performance tracking

### Content Management
- Edit pages: About, Terms, Privacy, FAQs
- Rich text editor

---

## 14. Design System Essentials

### Colors
- **Primary:** Brand color (CTAs, links)
- **Secondary:** Accent (highlights, badges)
- **Success:** Green (in-stock, delivered)
- **Warning:** Orange (low stock, pending)
- **Error:** Red (out-of-stock, failed)
- **Neutral:** Grays (backgrounds, borders, text)

### Typography
- **Headings:** Bold, clear hierarchy (H1-H6)
- **Body:** 16px minimum, good line-height
- **Price:** Large, bold, red/highlighted
- **Discount:** Strikethrough + badge

### Components
- **Buttons:** Primary (filled), Secondary (outline), Text
- **Cards:** Product, Review, Seller, Category
- **Badges:** New, Bestseller, Discount %, Verified
- **Input Fields:** Text, Number, Dropdown, Checkbox, Radio
- **Modals:** Address form, Quick view, Image lightbox
- **Toasts:** Success, Error, Info notifications
- **Loaders:** Spinners, Skeletons
- **Empty States:** Illustrations + CTA

### Icons
- Consistent style (outlined or filled)
- Use for: Cart, Search, User, Heart, Star, Share, Filter, etc.

### Spacing
- Consistent padding/margins (8px, 16px, 24px, 32px)
- Card spacing, section gaps

### Responsive
- **Mobile:** <640px - Hamburger menu, bottom nav, full-width cards
- **Tablet:** 640-1024px - 2-3 column grid
- **Desktop:** >1024px - 4-5 column grid, sidebar filters

### Interactions
- **Hover:** Color change, scale, shadow
- **Click:** Button press effect
- **Loading:** Progress indicators, skeleton screens
- **Animations:** Smooth transitions (300ms), fade-ins

---

## 15. Key UI States

### Loading States
- Skeleton screens (for product cards, content)
- Spinners (for buttons, page load)
- Progress bars (upload, checkout steps)

### Empty States
- Empty cart (illustration + "Continue Shopping")
- No search results
- No orders yet
- Wishlist empty

### Error States
- Form validation errors (red border, helper text)
- Payment failed
- Out of stock
- Network error

### Success States
- Order placed (checkmark animation)
- Item added to cart (toast notification)
- Review submitted
- Coupon applied

---

## 16. Mobile-Specific Considerations

### Navigation
- Bottom tab bar (Home, Categories, Cart, Account)
- Hamburger menu for categories
- Sticky search bar

### Product Cards
- Full-width or 2-column grid
- Larger tap targets (min 44px)

### Filters
- Bottom sheet modal (slide up)
- Apply/Clear buttons

### Cart
- Sticky "Checkout" button at bottom

### Images
- Swipe gesture for product gallery
- Pinch to zoom

---

## 17. Priority Features (Must-Have for MVP)

**Phase 1 (Core):**
1. ✅ Homepage with categories & banners
2. ✅ Product listing with filters (price, discount, rating)
3. ✅ Product detail page
4. ✅ Shopping cart
5. ✅ Checkout flow (address, payment)
6. ✅ User registration/login
7. ✅ Order tracking
8. ✅ Seller registration & product management
9. ✅ Basic admin panel (approve sellers, products)
10. ✅ Search functionality

**Phase 2 (Enhanced):**
- Flash sales
- Vouchers/coupons
- Wishlist
- Reviews & ratings
- Seller promotions
- Advanced filters (brand, delivery options)
- Multiple payment methods

**Phase 3 (Growth):**
- Loyalty program
- Referral system
- Live chat
- Mobile app
- Advanced analytics

---

## 18. User Experience Principles

### For Customers
- **Easy Discovery:** Clear categories, powerful search, smart filters
- **Trust Signals:** Reviews, verified sellers, secure payment badges
- **Quick Checkout:** Guest checkout option, saved addresses/cards
- **Transparency:** Clear pricing, delivery estimates, return policy
- **Visual Appeal:** High-quality images, clean layout, consistent design

### For Sellers
- **Simple Onboarding:** Step-by-step wizard, clear requirements
- **Easy Product Management:** Bulk upload, templates, quick edit
- **Clear Dashboard:** Key metrics at-a-glance, actionable insights
- **Fast Payouts:** Clear timeline, transparent fees
- **Support:** Help center, chat support, tutorials

### For Admin
- **Control:** Approve/reject workflow, content moderation
- **Insights:** Comprehensive analytics, exportable reports
- **Flexibility:** Configurable settings, campaign tools
- **Efficiency:** Bulk actions, quick filters, search

---

## 19. Success Criteria

### Customer Satisfaction
- Easy product discovery (max 3 clicks to any product)
- Fast checkout (under 2 minutes)
- Clear order tracking
- Responsive support

### Seller Success
- Quick product upload (under 5 minutes per product)
- Timely payouts (within 7 days)
- Sales visibility (real-time dashboard)
- Low return rates (under 5%)

### Platform Health
- High conversion rate (3-5%)
- Low cart abandonment (<70%)
- Growing seller base
- Positive reviews (4+ stars average)

---

## 20. Next Steps for Design Team

### Deliverables Needed
1. **Wireframes**
   - Low-fidelity (structure & layout)
   - Key screens: Homepage, Listing, PDP, Cart, Checkout, Dashboards

2. **Visual Design**
   - Design system (colors, typography, components)
   - High-fidelity mockups
   - Interactive prototype

3. **User Testing**
   - Usability testing on prototypes
   - Gather feedback, iterate

4. **Developer Handoff**
   - Design specs (spacing, colors, fonts)
   - Component library
   - Asset export (icons, images)

### Tools
- **Design:** Figma (recommended)
- **Prototype:** Figma, InVision
- **Handoff:** Figma Dev Mode, Zeplin

---

**END OF DOCUMENT**

_This PRD focuses on design and user experience. Technical implementation details to be defined separately by the development team._