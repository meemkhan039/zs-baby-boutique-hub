# ZS Garments Hub

Build a full-stack wholesale (paikari) e-commerce website for "ZS Garments" — a baby clothing wholesale shop based in Bangladesh.

Business type: B2B wholesale — customers are shopkeepers/resellers who buy in bulk, not individual end consumers.

Owner & Contact Info:

Owner name: Osama Bin Ibrahim

Phone: 01716314776 (make this clickable — tapping it should open the phone dialer directly, using a tel: link)

Shop address: Noyamati, Momtaz Market, Shop No. 15

Business hours: 10:00 AM – 8:00 PM, closed on Fridays

Show owner's name, phone (Call Now button), address, and hours in the website header/footer and on a dedicated "Contact Us" page

Core features needed:

Authentication

Signup/Login (Name, Shop Name, Phone Number, Email, Password)

Wholesale buyers must register before seeing prices (show "Login to see wholesale price" on product cards for guests)

Homepage

Hero banner with "ZS Garments" name and a tagline about baby wholesale clothing

Featured/New Arrival products section

Category showcase (e.g., Baby Frocks, Dungaree Sets, Winter Wear, Cotton Wear, Boys Sets, Girls Sets)

Owner contact info visible with a prominent "Call Now" button

Product Listing Page

Grid layout, filter by category, price range, size

Each product shows: image, name, wholesale price per piece, minimum order quantity (MOQ)

Search bar

Product Detail Page

Multiple images/gallery (support several photos per product)

Price per piece + bulk discount tiers (e.g., 12 pcs, 24 pcs, 50+ pcs pricing)

Size chart, fabric details, minimum order quantity

"Add to Cart" with quantity selector (in dozens/sets, since it's wholesale)

Cart & Checkout

Cart shows total pieces and total price

Checkout form: shop name, address, phone, delivery method (courier/pickup)

Order confirmation page (Cash on Delivery + bKash/Nagad manual payment option)

Admin Dashboard (very important — I need this to be simple and easy to use)

Add/Edit/Delete products with a simple form

Easy image upload: I need to upload multiple product photos anytime I want, using a simple drag-and-drop or "choose file" button, and be able to add new photos, reorder them, or delete old ones whenever I add a new dress design

View and manage orders (status: pending, confirmed, shipped, delivered)

View registered wholesale buyers

Simple sales overview (total orders, revenue)

Design requirements

Mobile-first (most buyers will browse on phone)

Pick a bright, clean, baby-friendly color theme that looks professional and attractive — your choice, just make it look good for a baby clothing brand

Bangla + English text support

Fast loading, simple navigation for non-technical shop owners

Tech: Use your default full-stack setup (React frontend + Supabase backend) with authentication, database, and image storage all connected.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://zs-baby-boutique-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/18c2b52f-cfb8-4743-a532-bd3ff3555315).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
