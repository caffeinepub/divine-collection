import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";

actor {
  type ProductId = Nat;

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

  module Product {
    public func compareByName(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type ContactMessage = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Time.Time;
  };

  let products = Map.empty<ProductId, Product>();
  var productIdCounter = 1;

  let contactMessages = Map.empty<Nat, ContactMessage>();
  var contactMessageIdCounter = 1;

  let initialProducts : [Product] = [
    // Sarees
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
};
