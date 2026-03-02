import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type ProductId = Nat;
  type CategoryId = Nat;
  type OrderId = Nat;
  type BannerId = Nat;
  type DiscountCodeId = Nat;

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Float;
    discountedPrice : ?Float;
    category : CategoryId;
    sizes : [Text];
    colors : [Text];
    gender : Text;
    images : [Storage.ExternalBlob];
    stock : Nat;
    isActive : Bool;
    createdAt : Time.Time;
  };

  module ProductUtil {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Category = {
    id : CategoryId;
    name : Text;
    description : Text;
    isActive : Bool;
  };

  type OrderItem = {
    productId : ProductId;
    name : Text;
    quantity : Nat;
    size : Text;
    color : Text;
    price : Float;
  };

  type CustomerInfo = {
    name : Text;
    phone : Text;
    address : Text;
    city : Text;
  };

  type PaymentMethod = {
    #cod;
    #esewa;
    #khalti;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  };

  type Order = {
    id : OrderId;
    customerId : Principal;
    items : [OrderItem];
    customerInfo : CustomerInfo;
    paymentMethod : PaymentMethod;
    paymentStatus : Bool;
    orderStatus : OrderStatus;
    totalAmount : Float;
    discountApplied : ?Float;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module OrderUtil {
    public func compare(o1 : Order, o2 : Order) : Order.Order {
      Nat.compare(o1.id, o2.id);
    };
  };

  type Banner = {
    id : BannerId;
    title : Text;
    imageRef : Storage.ExternalBlob;
    linkUrl : Text;
    isActive : Bool;
    displayOrder : Nat;
  };

  type DiscountType = {
    #percentage;
    #fixed;
  };

  type DiscountCode = {
    id : DiscountCodeId;
    code : Text;
    discountType : DiscountType;
    value : Float;
    minOrderAmount : ?Float;
    maxUses : ?Nat;
    usedCount : Nat;
    isActive : Bool;
    expiresAt : ?Time.Time;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    address : Text;
    city : Text;
  };

  let products = Map.empty<ProductId, Product>();
  let categories = Map.empty<CategoryId, Category>();
  let orders = Map.empty<OrderId, Order>();
  let banners = Map.empty<BannerId, Banner>();
  let discountCodes = Map.empty<DiscountCodeId, DiscountCode>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextOrderId = 1;
  var nextBannerId = 1;
  var nextDiscountCodeId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func filterProducts(category : ?CategoryId, gender : ?Text, minPrice : ?Float, maxPrice : ?Float, search : ?Text) : [Product] {
    products.values().toArray().filter(
      func(product) {
        switch (category) {
          case (null) { () };
          case (?cat) { if (product.category != cat) { return false } };
        };
        switch (gender) {
          case (null) { () };
          case (?g) { if (product.gender != g) { return false } };
        };
        switch (minPrice) {
          case (null) { () };
          case (?min) {
            if (product.price < min) { return false };
          };
        };
        switch (maxPrice) {
          case (null) { () };
          case (?max) {
            if (product.price > max) { return false };
          };
        };
        switch (search) {
          case (null) { true };
          case (?term) {
            product.name.toLower().contains(#text (term.toLower())) or product.description.toLower().contains(#text (term.toLower()));
          };
        };
      }
    );
  };

  public query ({ caller }) func getProducts(filterCategory : ?CategoryId, filterGender : ?Text, filterMinPrice : ?Float, filterMaxPrice : ?Float, searchTerm : ?Text) : async [Product] {
    filterProducts(filterCategory, filterGender, filterMinPrice, filterMaxPrice, searchTerm);
  };

  public query ({ caller }) func getProductById(id : ProductId) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func createProduct(name : Text, description : Text, price : Float, discountedPrice : ?Float, category : CategoryId, sizes : [Text], colors : [Text], gender : Text, images : [Storage.ExternalBlob], stock : Nat) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let productId = nextProductId;
    let product : Product = {
      id = productId;
      name;
      description;
      price;
      discountedPrice;
      category;
      sizes;
      colors;
      gender;
      images;
      stock;
      isActive = true;
      createdAt = Time.now();
    };
    products.add(productId, product);
    nextProductId += 1;
    productId;
  };

  public shared ({ caller }) func updateProduct(id : ProductId, name : Text, description : Text, price : Float, discountedPrice : ?Float, category : CategoryId, sizes : [Text], colors : [Text], gender : Text, images : [Storage.ExternalBlob], stock : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existing) {
        let updated : Product = {
          id;
          name;
          description;
          price;
          discountedPrice;
          category;
          sizes;
          colors;
          gender;
          images;
          stock;
          isActive = existing.isActive;
          createdAt = existing.createdAt;
        };
        products.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getCategoryById(id : CategoryId) : async ?Category {
    categories.get(id);
  };

  public shared ({ caller }) func createCategory(name : Text, description : Text) : async CategoryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let categoryId = nextCategoryId;
    let category : Category = {
      id = categoryId;
      name;
      description;
      isActive = true;
    };
    categories.add(categoryId, category);
    nextCategoryId += 1;
    categoryId;
  };

  public shared ({ caller }) func updateCategory(id : CategoryId, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?existing) {
        let updated : Category = {
          id;
          name;
          description;
          isActive = existing.isActive;
        };
        categories.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : CategoryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    categories.remove(id);
  };

  public shared ({ caller }) func createOrder(items : [OrderItem], customerInfo : CustomerInfo, paymentMethod : PaymentMethod, discountApplied : ?Float) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let orderId = nextOrderId;
    let totalAmount = items.foldLeft(0.0, func(acc, item) { acc + (item.price * item.quantity.toInt().toFloat()) });
    let order : Order = {
      id = orderId;
      customerId = caller;
      items;
      customerInfo;
      paymentMethod;
      paymentStatus = false;
      orderStatus = #pending;
      totalAmount;
      discountApplied;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    orders.add(orderId, order);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().filter(
      func(order) { order.customerId == caller }
    );
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrderById(id : OrderId) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only owners or admins can view this order");
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?existing) {
        let updated : Order = {
          id = existing.id;
          customerId = existing.customerId;
          items = existing.items;
          customerInfo = existing.customerInfo;
          paymentMethod = existing.paymentMethod;
          paymentStatus = existing.paymentStatus;
          orderStatus = status;
          totalAmount = existing.totalAmount;
          discountApplied = existing.discountApplied;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        orders.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getActiveBanners() : async [Banner] {
    banners.values().toArray().filter(
      func(banner) { banner.isActive }
    );
  };

  public query ({ caller }) func getAllBanners() : async [Banner] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all banners");
    };
    banners.values().toArray();
  };

  public shared ({ caller }) func createBanner(title : Text, imageRef : Storage.ExternalBlob, linkUrl : Text, displayOrder : Nat) : async BannerId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create banners");
    };
    let bannerId = nextBannerId;
    let banner : Banner = {
      id = bannerId;
      title;
      imageRef;
      linkUrl;
      isActive = true;
      displayOrder;
    };
    banners.add(bannerId, banner);
    nextBannerId += 1;
    bannerId;
  };

  public shared ({ caller }) func updateBanner(id : BannerId, title : Text, imageRef : Storage.ExternalBlob, linkUrl : Text, displayOrder : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update banners");
    };
    switch (banners.get(id)) {
      case (null) { Runtime.trap("Banner not found") };
      case (?existing) {
        let updated : Banner = {
          id;
          title;
          imageRef;
          linkUrl;
          isActive = existing.isActive;
          displayOrder;
        };
        banners.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteBanner(id : BannerId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete banners");
    };
    banners.remove(id);
  };

  public query ({ caller }) func validateDiscountCode(code : Text) : async ?DiscountCode {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate discount codes");
    };
    discountCodes.values().toArray().find(
      func(dc) { dc.code == code and dc.isActive }
    );
  };

  public shared ({ caller }) func createDiscountCode(code : Text, discountType : DiscountType, value : Float, minOrderAmount : ?Float, maxUses : ?Nat, expiresAt : ?Time.Time) : async DiscountCodeId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create discount codes");
    };
    let discountCodeId = nextDiscountCodeId;
    let discountCode : DiscountCode = {
      id = discountCodeId;
      code;
      discountType;
      value;
      minOrderAmount;
      maxUses;
      usedCount = 0;
      isActive = true;
      expiresAt;
    };
    discountCodes.add(discountCodeId, discountCode);
    nextDiscountCodeId += 1;
    discountCodeId;
  };

  public query ({ caller }) func getDiscountCodes() : async [DiscountCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view discount codes");
    };
    discountCodes.values().toArray();
  };

  public shared ({ caller }) func updateDiscountCode(id : DiscountCodeId, code : Text, discountType : DiscountType, value : Float, minOrderAmount : ?Float, maxUses : ?Nat, expiresAt : ?Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update discount codes");
    };
    switch (discountCodes.get(id)) {
      case (null) { Runtime.trap("Discount code not found") };
      case (?existing) {
        let updated : DiscountCode = {
          id;
          code;
          discountType;
          value;
          minOrderAmount;
          maxUses;
          usedCount = existing.usedCount;
          isActive = existing.isActive;
          expiresAt;
        };
        discountCodes.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteDiscountCode(id : DiscountCodeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete discount codes");
    };
    discountCodes.remove(id);
  };
};
