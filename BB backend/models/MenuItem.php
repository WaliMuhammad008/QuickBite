<?php
class MenuItem {
    private $conn;
    private $table_name = "menu_items";

    public $id;
    public $name;
    public $description;
    public $price;
    public $category;
    public $img;
    public $isAvailable;
    public $isTopDeal;
    public $isBestSeller;

    public function __construct($db) { 
        $this->conn = $db; 
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, description=:description, price=:price, category=:category, img=:img, isAvailable=:isAvailable, isTopDeal=:isTopDeal, isBestSeller=:isBestSeller";

        $stmt = $this->conn->prepare($query);
        $this->bindParams($stmt);
        return $stmt->execute();
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, description=:description, price=:price, category=:category, img=:img, isAvailable=:isAvailable, isTopDeal=:isTopDeal, isBestSeller=:isBestSeller 
                  WHERE id=:id";
                  
        $stmt = $this->conn->prepare($query);
        $this->bindParams($stmt);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }

    // COMMON FUNCTION FOR BINDING
    private function bindParams($stmt) {
        // Sanitize values
        $this->name = strip_tags($this->name);
        $this->description = strip_tags($this->description);
        $this->price = strip_tags($this->price);
        $this->category = strip_tags($this->category);
        $this->img = strip_tags($this->img);

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":img", $this->img);

        $isAvail = $this->isAvailable ? 1 : 0;
        $isTop = $this->isTopDeal ? 1 : 0;
        $isBest = $this->isBestSeller ? 1 : 0;

        $stmt->bindParam(":isAvailable", $isAvail, PDO::PARAM_INT);
        $stmt->bindParam(":isTopDeal", $isTop, PDO::PARAM_INT);
        $stmt->bindParam(":isBestSeller", $isBest, PDO::PARAM_INT);
    }
}
?>