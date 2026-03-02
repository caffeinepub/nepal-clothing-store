# Nepal Clothing Store

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
**Storefront (Customer-facing)**
- Homepage with hero banners (rotating/static), featured categories, featured products
- Product listing page with filters (category, price range, size, color, gender)
- Product detail page (images, description, sizes, add to cart)
- Shopping cart (sidebar or page, quantity update, remove items)
- Checkout page with customer info, shipping address, order summary, and payment method selection (Cash on Delivery, eSewa mock, Khalti mock)
- User registration and login (Internet Identity or email/password)
- User account page: order history, profile info
- Order confirmation page

**Admin Dashboard (Shop Owner)**
- Protected admin section (role-based: admin vs customer)
- Product management: add/edit/delete products (name, description, price, images, category, sizes, stock, discount)
- Category management: add/edit/delete categories
- Order management: view orders, update order status (pending/processing/shipped/delivered/cancelled)
- Banner management: upload/manage homepage banners
- Discount codes: create/manage coupon codes (percentage or fixed amount)
- Basic sales analytics: total revenue, orders count, top products, recent orders
- Store settings: store name, contact info, currency (NPR)

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Select authorization component for role-based access (admin vs customer)
2. Select blob-storage for product images and banners
3. Generate Motoko backend with: User/auth, Products, Categories, Orders, Cart, Banners, DiscountCodes, Analytics
4. Build frontend: storefront pages, admin dashboard, routing, state management, UI components
