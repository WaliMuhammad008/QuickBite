<?php
class Category {
    private $conn;
    private $table = "categories";

    public $id;
    public $name;
    public $img;
    public $show_on_hero;

    public function __construct($db) { $this->conn = $db; }

    public function create() {
        $query = "INSERT INTO " . $this->table . " SET name=:name, img=:img, show_on_hero=:show_on_hero";
        $stmt = $this->conn->prepare($query);
        $this->name = strip_tags($this->name);
        $this->img = strip_tags($this->img);
        $this->show_on_hero = !empty($this->show_on_hero) ? 1 : 0;
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":img", $this->img);
        $stmt->bindParam(":show_on_hero", $this->show_on_hero, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    //  Update Function
    public function update() {
        $query = "UPDATE " . $this->table . " SET name=:name, img=:img, show_on_hero=:show_on_hero WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        
        $this->name = strip_tags($this->name);
        $this->img = strip_tags($this->img);
        $this->id = strip_tags($this->id);
        $this->show_on_hero = !empty($this->show_on_hero) ? 1 : 0;
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":img", $this->img);
        $stmt->bindParam(":show_on_hero", $this->show_on_hero, PDO::PARAM_INT);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }

    //  Delete Function
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = strip_tags($this->id);
        $stmt->bindParam(":id", $this->id);
        return $stmt->execute();
    }
}
?>