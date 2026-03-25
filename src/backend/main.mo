import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";



actor {
  //----------------------------------------
  // Type Definitions
  //----------------------------------------
  type ProductId = Nat;
  type Timestamp = Int;

  type Category = {
    #Sarees;
    #CoordSets;
    #Kurties;
  };

  type Product = {
    id : ProductId;
    name : Text;
    category : Category;
    price : Nat;
    description : Text;
    isFeatured : Bool;
  };

  type ContactMessage = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Timestamp;
  };

  type SaleId = Nat;
  type SaleItem = {
    productId : Text;
    productName : Text;
    size : Text;
    quantity : Nat;
    price : Nat;
  };

  type Sale = {
    id : SaleId;
    date : Timestamp;
    customerName : Text;
    mobile : Text;
    address : Text;
    items : [SaleItem];
    total : Nat;
  };

  type StockEntry = {
    productId : Text;
    productName : Text;
    category : Text;
    size : Text;
    quantity : Nat;
  };

  type CostPriceEntry = {
    productId : Text;
    costPrice : Float;
  };

  type VisitRecord = {
    page : Text;
    timestamp : Timestamp;
  };

  type ProductOverride = {
    productId : Text;
    price : ?Nat;
    description : ?Text;
    imageUrl : ?Text;
  };

  type DynamicCategory = {
    id : Text;
    name : Text;
    displayOrder : Nat;
  };

  type DynamicProduct = {
    id : Text;
    categoryId : Text;
    name : Text;
    description : Text;
    price : Nat;
    sizes : [Text];
    imageUrl : ?Text;
    displayOrder : Nat;
    isActive : Bool;
  };

  //----------------------------------------
  // Product Management
  //----------------------------------------
  let products = Map.empty<ProductId, Product>();
  var productIdCounter = 1;

  let initialProducts : [Product] = [
    {
      id = 1;
      name = "Banarasi Silk Saree";
      category = #Sarees;
      price = 5999;
      description = "Exquisite handwoven Banarasi silk saree with intricate zari work.";
      isFeatured = true;
    },
    {
      id = 2;
      name = "Chiffon Designer Saree";
      category = #Sarees;
      price = 3599;
      description = "Lightweight chiffon saree with elegant digital prints and border.";
      isFeatured = false;
    },
    {
      id = 3;
      name = "Kanjivaram Pure Silk";
      category = #Sarees;
      price = 7999;
      description = "Classic Kanjivaram pure silk saree in vibrant colors and motifs.";
      isFeatured = true;
    },

    // CoordSets
    {
      id = 4;
      name = "Linen Coord Set";
      category = #CoordSets;
      price = 2599;
      description = "Comfortable linen coord set in pastel colors for summer.";
      isFeatured = true;
    },
    {
      id = 5;
      name = "Formal Blazer & Pants";
      category = #CoordSets;
      price = 3999;
      description = "Formal blazer and pants set, tailored and suitable for office wear.";
      isFeatured = false;
    },
    {
      id = 6;
      name = "Festive Kurta Set";
      category = #CoordSets;
      price = 2999;
      description = "Festive occasionwear kurta and pant set with matching dupatta.";
      isFeatured = true;
    },

    // Kurties
    {
      id = 7;
      name = "Cotton A-Line Kurti";
      category = #Kurties;
      price = 1399;
      description = "Premium cotton A-line kurti with patchwork design.";
      isFeatured = false;
    },
    {
      id = 8;
      name = "Anarkali Kurti";
      category = #Kurties;
      price = 1899;
      description = "Flowy anarkali style kurti in soft georgette fabric.";
      isFeatured = true;
    },
    {
      id = 9;
      name = "Straight Cut Kurti";
      category = #Kurties;
      price = 1199;
      description = "Straight cut, knee-length kurti for everyday wear.";
      isFeatured = false;
    },
  ];

  module Product {
    public func compareByName(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  public shared ({ caller }) func init() : async () {
    if (products.size() == 0) {
      for (product in initialProducts.values()) {
        products.add(product.id, product);
      };
      productIdCounter := 10;
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort(Product.compareByName);
  };

  public query ({ caller }) func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(
      func(p) { p.category == category }
    ).sort(Product.compareByName);
  };

  public query ({ caller }) func getProductById(id : ProductId) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(
      func(p) { p.isFeatured }
    ).sort(Product.compareByName);
  };

  //----------------------------------------
  // Contact Messages
  //----------------------------------------
  var contactMessageIdCounter = 1;
  let contactMessages = Map.empty<Nat, ContactMessage>();

  public shared ({ caller }) func submitContactMessage(name : Text, email : Text, message : Text) : async () {
    let contactMessage : ContactMessage = {
      name;
      email;
      message;
      timestamp = Time.now();
    };
    contactMessages.add(contactMessageIdCounter, contactMessage);
    contactMessageIdCounter += 1;
  };

  public query ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    contactMessages.values().toArray();
  };

  //----------------------------------------
  // Sales, Stock & Analytics
  //----------------------------------------
  var saleIdCounter = 1;
  let sales = Map.empty<SaleId, Sale>();
  let stock = Map.empty<Text, StockEntry>();
  let costPrices = Map.empty<Text, CostPriceEntry>();
  let analytics = Map.empty<Nat, VisitRecord>();

  //- Sales
  public shared ({ caller }) func addSale(
    customerName : Text,
    mobile : Text,
    address : Text,
    items : [SaleItem],
    total : Nat,
  ) : async () {
    let sale : Sale = {
      id = saleIdCounter;
      date = Time.now();
      customerName;
      mobile;
      address;
      items;
      total;
    };
    sales.add(saleIdCounter, sale);
    saleIdCounter += 1;
  };

  public query ({ caller }) func getAllSales() : async [Sale] {
    sales.values().toArray();
  };

  //- Stock Management
  func createStockKey(productId : Text, size : Text) : Text {
    productId # ":" # size;
  };

  public query ({ caller }) func getStock() : async [StockEntry] {
    stock.values().toArray();
  };

  public shared ({ caller }) func setStockEntry(productId : Text, productName : Text, category : Text, size : Text, quantity : Nat) : async () {
    let entry : StockEntry = {
      productId;
      productName;
      category;
      size;
      quantity;
    };
    stock.add(createStockKey(productId, size), entry);
  };

  public shared ({ caller }) func deductStock(productId : Text, size : Text, amount : Nat) : async () {
    let key = createStockKey(productId, size);
    let currentQuantity = switch (stock.get(key)) {
      case (null) { 0 };
      case (?entry) { entry.quantity };
    };

    let newQuantity = if (amount >= currentQuantity) { 0 } else { currentQuantity - amount };
    let updatedEntry = switch (stock.get(key)) {
      case (null) {
        {
          productId;
          productName = "";
          category = "";
          size;
          quantity = newQuantity;
        };
      };
      case (?entry) {
        { entry with quantity = newQuantity };
      };
    };
    stock.add(key, updatedEntry);
  };

  public shared ({ caller }) func initStock(entries : [StockEntry]) : async () {
    stock.clear();
    for (entry in entries.values()) {
      stock.add(createStockKey(entry.productId, entry.size), entry);
    };
  };

  public shared ({ caller }) func resetAllStock() : async () {
    stock.clear();
  };

  //- Cost Prices
  public query ({ caller }) func getCostPrices() : async [CostPriceEntry] {
    costPrices.values().toArray();
  };

  public shared ({ caller }) func setCostPrice(productId : Text, costPrice : Float) : async () {
    let entry : CostPriceEntry = {
      productId;
      costPrice;
    };
    costPrices.add(productId, entry);
  };

  //- Analytics/Visits
  var analyticsRecordIdCounter = 1;
  public shared ({ caller }) func recordVisit(page : Text) : async () {
    let record : VisitRecord = {
      page;
      timestamp = Time.now();
    };
    analytics.add(analyticsRecordIdCounter, record);
    analyticsRecordIdCounter += 1;
  };

  public query ({ caller }) func getAnalytics() : async [VisitRecord] {
    analytics.values().toArray();
  };

  //----------------------------------------
  // Product Overrides (dynamic catalog management)
  //----------------------------------------
  let productOverrides = Map.empty<Text, ProductOverride>();

  public shared ({ caller }) func setProductOverride(
    productId : Text,
    price : ?Nat,
    description : ?Text,
    imageUrl : ?Text,
  ) : async () {
    let entry : ProductOverride = {
      productId;
      price;
      description;
      imageUrl;
    };
    productOverrides.add(productId, entry);
  };

  public query ({ caller }) func getProductOverrides() : async [ProductOverride] {
    productOverrides.values().toArray();
  };

  //----------------------------------------
  // Dynamic Catalog Management
  //----------------------------------------
  let dynamicCategories = Map.empty<Text, DynamicCategory>();
  let dynamicProducts = Map.empty<Text, DynamicProduct>();

  //- Dynamic Categories
  public shared ({ caller }) func addDynamicCategory(name : Text) : async Text {
    let id = Time.now().toText() # name # "cat";
    let category : DynamicCategory = {
      id;
      name;
      displayOrder = dynamicCategories.size() + 1;
    };
    dynamicCategories.add(id, category);
    id;
  };

  public shared ({ caller }) func updateDynamicCategory(id : Text, name : Text) : async Bool {
    switch (dynamicCategories.get(id)) {
      case (null) { false };
      case (?cat) {
        dynamicCategories.add(id, {
          id;
          name;
          displayOrder = cat.displayOrder;
        });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteDynamicCategory(id : Text) : async Bool {
    if (dynamicCategories.containsKey(id)) {
      dynamicCategories.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getDynamicCategories() : async [DynamicCategory] {
    let categories = dynamicCategories.values().toArray();
    categories.sort(
      func(a, b) {
        Int.compare(a.displayOrder, b.displayOrder);
      }
    );
  };

  public shared ({ caller }) func setCategoryOrder(id : Text, newOrder : Nat) : async () {
    switch (dynamicCategories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) {
        dynamicCategories.add(id, {
          id;
          name = category.name;
          displayOrder = newOrder;
        });
      };
    };
  };

  //- Dynamic Products
  public shared ({ caller }) func addDynamicProduct(
    categoryId : Text,
    name : Text,
    description : Text,
    price : Nat,
    sizes : [Text],
    imageUrl : ?Text,
  ) : async Text {
    let id = categoryId # name # Time.now().toText();
    let product : DynamicProduct = {
      id;
      categoryId;
      name;
      description;
      price;
      sizes;
      imageUrl;
      displayOrder = Time.now().toNat();
      isActive = true;
    };
    dynamicProducts.add(id, product);
    id;
  };

  public shared ({ caller }) func updateDynamicProduct(
    id : Text,
    name : Text,
    description : Text,
    price : Nat,
    sizes : [Text],
    imageUrl : ?Text,
    isActive : Bool,
  ) : async Bool {
    switch (dynamicProducts.get(id)) {
      case (null) { false };
      case (?prod) {
        dynamicProducts.add(id, {
          id;
          categoryId = prod.categoryId;
          name;
          description;
          price;
          sizes;
          imageUrl;
          displayOrder = prod.displayOrder;
          isActive;
        });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteDynamicProduct(id : Text) : async Bool {
    if (dynamicProducts.containsKey(id)) {
      dynamicProducts.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getDynamicProducts() : async [DynamicProduct] {
    let products = dynamicProducts.values().toArray();
    products.sort(
      func(a, b) {
        switch (Text.compare(a.categoryId, b.categoryId)) {
          case (#less) { #less };
          case (#greater) { #greater };
          case (#equal) { Int.compare(a.displayOrder, b.displayOrder) };
        };
      }
    );
  };

  public query ({ caller }) func getDynamicProductsByCategory(categoryId : Text) : async [DynamicProduct] {
    let products = dynamicProducts.values().toArray().filter(
      func(prod) { prod.categoryId == categoryId }
    );
    products.sort(
      func(a, b) {
        Int.compare(a.displayOrder, b.displayOrder);
      }
    );
  };

  public shared ({ caller }) func setDynamicProductOrder(id : Text, newOrder : Nat) : async () {
    switch (dynamicProducts.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?prod) {
        dynamicProducts.add(id, {
          id;
          categoryId = prod.categoryId;
          name = prod.name;
          description = prod.description;
          price = prod.price;
          sizes = prod.sizes;
          imageUrl = prod.imageUrl;
          displayOrder = newOrder;
          isActive = prod.isActive;
        });
      };
    };
  };

  //----------------------------------------
  // File Uploads (Mixin from blob-storage)
  //----------------------------------------
  include MixinStorage();
};
