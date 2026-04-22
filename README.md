# Bloom & Brreeze Cafe Website Enhancements Summary

This document summarizes the technical enhancements and features implemented for the Bloom & Brreeze Cafe website to enable dynamic content management and improved user interaction.

## 1. Dynamic Content Integration (Google Sheets)

The website is now connected to Google Sheets via the OpenSheet API, allowing the client to update content in real-time without touching the code.

### Menu System (`menu.html`)
- **Real-time Updates**: Menu items, prices, and descriptions are fetched dynamically.
- **Auto-Categorization**: Items are automatically grouped by category (e.g., Pizza, Pasta, Breakfast).
- **Interactive Details**: Clicking a category opens a detailed view of all items in that category.

### Events & Community (`about.html`)
- **Automated Showcase**: The latest events are pulled directly from the "Events" spreadsheet.
- **Dynamic Layout**: Each event row (Title, Subtitle, Description, and Image) is populated automatically.

---

## 2. Advanced Image Handling System

A robust, "client-proof" image logic has been implemented to handle various input formats and prevent UI breakage.

- **Google Drive Support**: Automatically converts Google Drive sharing links into direct-embeddable thumbnail URLs.
- **Intelligent Fallbacks**:
    - If a specific image is missing, the system assigns a high-quality default based on the **Category**.
    - If a link is broken (404), the system displays a clean "Bloom & Brreeze" branded placeholder.
- **Flexible Key Mapping**: Handles both uppercase (e.g., `Image`) and lowercase (e.g., `image`) headers from the spreadsheet.

---

## 3. WhatsApp Call-to-Action (CTA) Features

New interaction points have been added to drive direct bookings and orders via WhatsApp.

### Global Navbar
- **"Book a Table" Button**: A premium pill-shaped button on the right side of the navbar (desktop & mobile).
- **Accessibility**: Also integrated into the mobile sidebar menu for easy access on smaller screens.

### Direct Ordering (Contact Section)
- **Unified Order Card**: On the contact page, Zomato and WhatsApp ordering are grouped into a single, clean card with an "or" divider.
- **Proximity CTA**: Added a specific callout for nearby customers to order directly via WhatsApp.

---

## 4. Design & Performance Optimizations

- **Responsive Design**: All new elements (buttons, cards, wrappers) are fully responsive and tested across mobile, tablet, and desktop sizes.
- **Premium Aesthetics**: Maintained the "Botanical Noir" theme with custom fonts (Poppins, Outfit, Playfair Display) and smooth animations (reveal-up, fade).
- **Smooth Scrolling**: Integrated **Lenis** for premium momentum-based scrolling.
- **Performance**: Used `loading="lazy"` for all dynamic images and minimized DOM reflows.

---

## 5. How to Update Content (Client Guide)

The client can manage all website content directly through Google Sheets. No coding knowledge is required.

### Steps to Update:
1.  **Open the Spreadsheet**: Use the links provided in the "Links & APIs" section below.
2.  **Edit or Add Rows**:
    *   **Menu**: Add items with a Name, Category, Price, and Description. The website will automatically group them.
    *   **Events**: Update the Title, Subtitle, and Description. The first item in the list will be featured prominently.
3.  **Updating Images**:
    *   **Direct Links**: Paste any image URL from the web (e.g., Unsplash, Pexels).
    *   **Google Drive**: Paste the "Sharing Link" of an image from your Drive. Ensure the file is set to *"Anyone with the link can view"*. The system will handle the conversion automatically.
    *   **Empty Fields**: If you leave an image field blank, the website will automatically pull a high-quality default image based on the category.
4.  **Save & Refresh**: Changes are saved automatically in Google Sheets. Simply refresh the website to see the updates live.

---

### Links & APIs Used:
- **Menu Sheet**: [Google Sheets Link](https://docs.google.com/spreadsheets/d/1YxQHRN1I54pNH00nb3MTYsTNl0rVNCRMdJwsMblVesc/)
- **Events Sheet**: [Google Sheets Link](https://docs.google.com/spreadsheets/d/19oE6kKYZBelK8tauiEPEuBSmHi8awFlDZ_HJdY5nlcw/)
- **API Engine**: [OpenSheet](https://opensheet.elk.sh/)
