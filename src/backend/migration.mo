import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";

module {
  //------------------------
  // Type Definitions
  //------------------------
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

  type ContactMessage = {
    name : Text;
    email : Text;
    message : Text;
    timestamp : Timestamp;
  };

  type OldActor = {
    products : Map.Map<ProductId, Product>;
    productIdCounter : Nat;
    initialProducts : [Product];
    contactMessageIdCounter : Nat;
    contactMessages : Map.Map<Nat, ContactMessage>;
  };

  type NewActor = OldActor;

  public func run(old : OldActor) : NewActor {
    old;
  };
};
