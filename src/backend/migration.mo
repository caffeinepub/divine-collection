import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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

  type OldActor = {
    products : Map.Map<ProductId, Product>;
    productIdCounter : Nat;
    contactMessageIdCounter : Nat;
    contactMessages : Map.Map<Nat, ContactMessage>;
    saleIdCounter : Nat;
    sales : Map.Map<SaleId, Sale>;
    stock : Map.Map<Text, StockEntry>;
    costPrices : Map.Map<Text, CostPriceEntry>;
    analytics : Map.Map<Nat, VisitRecord>;
    analyticsRecordIdCounter : Nat;
    productOverrides : Map.Map<Text, ProductOverride>;
  };

  type NewActor = {
    products : Map.Map<ProductId, Product>;
    productIdCounter : Nat;
    contactMessageIdCounter : Nat;
    contactMessages : Map.Map<Nat, ContactMessage>;
    saleIdCounter : Nat;
    sales : Map.Map<SaleId, Sale>;
    stock : Map.Map<Text, StockEntry>;
    costPrices : Map.Map<Text, CostPriceEntry>;
    analytics : Map.Map<Nat, VisitRecord>;
    analyticsRecordIdCounter : Nat;
    productOverrides : Map.Map<Text, ProductOverride>;
    dynamicCategories : Map.Map<Text, DynamicCategory>;
    dynamicProducts : Map.Map<Text, DynamicProduct>;
  };

  public func run(old : OldActor) : NewActor {
    let defaultCategories = Map.fromIter<Text, DynamicCategory>([
      ("suit-sets", { id = "suit-sets"; name = "Suit Sets"; displayOrder = 1 }),
      ("kurti-sets", { id = "kurti-sets"; name = "Kurti Sets"; displayOrder = 2 }),
      ("coord-sets", { id = "coord-sets"; name = "Co-ord Sets"; displayOrder = 3 }),
    ].values());

    let defaultProducts = Map.fromIter<Text, DynamicProduct>([
      // Suit Sets
      (
        "suit1",
        {
          id = "suit1";
          categoryId = "suit-sets";
          name = "Suit 1";
          description = "Premium quality suit set with digital print.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit1.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "suit2",
        {
          id = "suit2";
          categoryId = "suit-sets";
          name = "Suit 2";
          description = "Stylish and comfortable yellow suit set.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit2.jpg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "suit3",
        {
          id = "suit3";
          categoryId = "suit-sets";
          name = "Suit 3";
          description = "Trendy abstract print suit set for casual wear.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit3.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "suit4",
        {
          id = "suit4";
          categoryId = "suit-sets";
          name = "Suit 4";
          description = "Comfortable linen fabric suit set.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit4.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "suit5",
        {
          id = "suit5";
          categoryId = "suit-sets";
          name = "Suit 5";
          description = "Elegant summer collection suit set.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit5.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "suit6",
        {
          id = "suit6";
          categoryId = "suit-sets";
          name = "Suit 6";
          description = "Beautiful floral print suit set with matching dupatta.";
          price = 950;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/suit6.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),

      // Kurtis
      (
        "kurti1",
        {
          id = "kurti1";
          categoryId = "kurti-sets";
          name = "Kurti 1";
          description = "Comfortable rayon kurti for everyday wear.";
          price = 650;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/kurti1.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "kurti2",
        {
          id = "kurti2";
          categoryId = "kurti-sets";
          name = "Kurti 2";
          description = "Elegant party wear kurti set.";
          price = 650;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/kurti2.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
      (
        "kurti3",
        {
          id = "kurti3";
          categoryId = "kurti-sets";
          name = "Kurti 3";
          description = "Trendy modern design kurti for women.";
          price = 650;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/kurti3.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),

      // Co-ord Sets
      (
        "coord1",
        {
          id = "coord1";
          categoryId = "coord-sets";
          name = "Co-ord Set 1";
          description = "Stylish co-ord set for women, perfect for parties.";
          price = 595;
          sizes = ["M", "L", "XL", "XXL"];
          imageUrl = ?"/assets/uploads/coord1.jpeg";
          displayOrder = Time.now().toNat();
          isActive = true;
        },
      ),
    ].values());

    { old with dynamicCategories = defaultCategories; dynamicProducts = defaultProducts };
  };
};
