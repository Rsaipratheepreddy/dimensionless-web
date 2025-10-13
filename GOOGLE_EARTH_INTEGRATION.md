# Google Earth Integration Section

## Overview

I've created a comprehensive Google Earth integration section for your Dimensionless Studios website that allows visitors to explore your studio location in 3D and get directions easily.

## 🌍 Features Implemented

### **1. Interactive Map Display**
- Embedded Google Maps iframe showing your studio location
- Animated overlay with location coordinates
- Responsive design that works on all devices
- Beautiful gradient background with interactive elements

### **2. Google Earth Integration**
- Direct link to Google Earth Web showing your location in 3D
- Custom URL that focuses on your studio coordinates
- One-click access to explore the area in immersive 3D view

### **3. Location Information Cards**
- **Location**: Full address with visual map pin icon
- **Phone**: Clickable phone number for direct calls
- **Email**: Clickable email for instant contact
- **Hours**: Business operating hours display

### **4. Action Buttons**
- **"View on Google Earth"**: Opens Google Earth Web in new tab
- **"Get Directions"**: Opens Google Maps for navigation
- Both buttons have hover animations and external link indicators

### **5. Additional Features**
- **360° Virtual Tour** indicator
- **Studio Layout** showcase
- **Nearby Landmarks** reference
- Animated globe icon with continuous rotation
- Pulsing effects for visual appeal

## 🎨 Design Features

### **Dark/Light Mode Support**
- Seamless integration with your existing theme system
- Theme-aware colors and animations
- Proper contrast in both modes

### **Animations**
- GSAP-powered scroll animations
- Staggered card reveals
- Smooth button hover effects
- Rotating globe icon
- Pulsing map overlay

### **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly buttons
- Accessible on all screen sizes

## 📍 Location Configuration

Currently configured for Mumbai coordinates, but easily customizable:

```typescript
const locationData: LocationData = {
    name: "Dimensionless Studios",
    address: "123 Creative Street, Art District, Mumbai, Maharashtra 400001, India",
    coordinates: {
        lat: 19.0760,  // Your actual latitude
        lng: 72.8777   // Your actual longitude
    },
    phone: "+91 98765 43210",
    email: "contact@dimensionlessstudios.com",
    hours: "Mon-Sat: 10:00 AM - 8:00 PM",
    // ... other details
};
```

## 🔧 How to Customize

### **Update Your Location**
1. Edit the `locationData` object in `GoogleEarthSection.tsx`
2. Replace coordinates with your actual studio location
3. Update address, phone, email, and hours

### **Google Earth URL**
The component automatically generates the Google Earth URL:
```typescript
googleEarthUrl: `https://earth.google.com/web/search/${encodeURIComponent("Dimensionless Studios Mumbai")}/@19.0760,72.8777,10a,1000d,35y,0h,0t,0r`
```

### **Google Maps Embed**
The iframe uses Google Maps Embed API:
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!..."/>
```

## 🚀 Integration

The section is now added to your main page between Services and Story sections:

```tsx
<Services />
<GoogleEarthSection 
  onViewOnEarthClick={handleViewOnEarth}
  onGetDirectionsClick={handleGetDirections}
/>
<Story />
```

## 📱 User Experience

### **Desktop Experience**
- Large map display with information cards on the side
- Hover effects and smooth animations
- Easy-to-click action buttons

### **Mobile Experience**
- Stacked layout for better readability
- Touch-optimized buttons
- Compressed information cards
- Responsive map sizing

### **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Alternative text for images

## 🔗 External Links

### **Google Earth Web**
- Opens your location in Google Earth's 3D web viewer
- Allows users to explore the area in detail
- Supports street view and satellite imagery

### **Google Maps**
- Direct navigation from user's current location
- Public transit options
- Real-time traffic information

## 🎯 Benefits

### **For Your Business**
- **Increased Visibility**: Easy for customers to find you
- **Professional Appearance**: Modern, tech-forward presentation
- **Accessibility**: Multiple ways to contact and locate you
- **Interactive Engagement**: 3D exploration creates memorable experience

### **For Your Customers**
- **Easy Navigation**: One-click directions
- **Visual Context**: See your studio location in 3D
- **Multiple Contact Options**: Phone, email, and location
- **Hours Information**: Know when to visit

## 🔄 Next Steps

1. **Update Location Data**: Replace the sample coordinates with your actual studio location
2. **Customize Content**: Adjust the address, phone, email, and hours
3. **Test Integration**: Verify the Google Earth and Maps links work correctly
4. **Analytics**: Consider adding tracking for button clicks

The Google Earth section is now live and ready to help customers find and connect with your studio! 🌍✨ 