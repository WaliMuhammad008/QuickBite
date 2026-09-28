<?php
class Order {
    private $conn;
    private $table_orders = "orders";
    private $table_items = "order_items";
    private $table_payments = "payments"; 

    public function __construct($db) { $this->conn = $db; }

    // Create Order Function
    public function createOrder($order_type, $customer_name, $customer_mobile, $customer_address, $table_number, $total, $cart_items) {
        try {
            $this->conn->beginTransaction(); 
            
            // 🔥 Yahan VALUES wala syntax use kiya hai (zyada secure aur standard)
            $query = "INSERT INTO " . $this->table_orders . " 
                      (order_type, customer_name, customer_mobile, customer_address, table_number, total, status) 
                      VALUES (:order_type, :customer_name, :customer_mobile, :customer_address, :table_number, :total, 'Pending')";
                      
            
            $stmt = $this->conn->prepare($query);
            
            // 🔥 Strict Null Checks (Kyunke khali string '' integer/DB ko crash karti hai)
            $order_type = !empty($order_type) ? htmlspecialchars(strip_tags($order_type)) : 'Dine-In';
            $customer_name = !empty($customer_name) ? htmlspecialchars(strip_tags($customer_name)) : 'Walk-in';
            $customer_mobile = !empty($customer_mobile) ? htmlspecialchars(strip_tags($customer_mobile)) : null;
            $customer_address = !empty($customer_address) ? htmlspecialchars(strip_tags($customer_address)) : null;
            $table_number = !empty($table_number) ? htmlspecialchars(strip_tags($table_number)) : null;
            $total = htmlspecialchars(strip_tags($total));

            $stmt->bindParam(":order_type", $order_type);
            $stmt->bindParam(":customer_name", $customer_name);
            $stmt->bindParam(":customer_mobile", $customer_mobile);
            $stmt->bindParam(":customer_address", $customer_address);
            $stmt->bindParam(":table_number", $table_number);
            $stmt->bindParam(":total", $total);
            
            $stmt->execute();
            $order_id = $this->conn->lastInsertId(); 

            // Items insert
            $item_query = "INSERT INTO " . $this->table_items . " (order_id, title, size, note, qty, price) VALUES (:order_id, :title, :size, :note, :qty, :price)";
            $item_stmt = $this->conn->prepare($item_query);

            foreach($cart_items as $item) {
                // Item details safe kiye
                $title = htmlspecialchars(strip_tags($item->title));
                $size = isset($item->size) ? htmlspecialchars(strip_tags($item->size)) : 'Regular';
                $note = isset($item->note) ? htmlspecialchars(strip_tags($item->note)) : '';
                $qty = htmlspecialchars(strip_tags($item->qty));
                $price = htmlspecialchars(strip_tags($item->price));

                $item_stmt->bindParam(":order_id", $order_id);
                $item_stmt->bindParam(":title", $title);
                $item_stmt->bindParam(":size", $size);
                $item_stmt->bindParam(":note", $note);
                $item_stmt->bindParam(":qty", $qty);
                $item_stmt->bindParam(":price", $price);
                $item_stmt->execute();

                // 🔥 INVENTORY DEDUCTION (Sirf ID bhej rahe hain function mein)
                $menu_item_id = intval($item->id); // React id bhej raha hai
                if ($menu_item_id > 0) {
                    $this->deductInventoryStock($menu_item_id, $qty);
                }
            }

            // Payment status
            $payment_query = "INSERT INTO " . $this->table_payments . " (order_id, amount, method, status) VALUES (:order_id, :amount, 'Cash', 'Pending')";
            $payment_stmt = $this->conn->prepare($payment_query);
            $payment_stmt->bindParam(":order_id", $order_id);
            $payment_stmt->bindParam(":amount", $total);
            $payment_stmt->execute();

            $this->conn->commit(); 
            return $order_id; 

        } catch(PDOException $e) {
            $this->conn->rollBack(); 
            // 🛑 DEBUGGING TIP: Agar ab bhi order na jaye tou yahan return false hata kar error dekh sakte hain
            return false;
        }
    }

    public function getAllOrders() {
        $query = "SELECT o.*, 
                         COALESCE(p.status, 'Pending') as payment_status, 
                         COALESCE(p.method, 'Cash') as payment_method 
                  FROM " . $this->table_orders . " o 
                  LEFT JOIN " . $this->table_payments . " p ON o.id = p.order_id 
                  ORDER BY o.id DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $item_query = "SELECT title, size, note, qty, price FROM " . $this->table_items . " WHERE order_id = :order_id";
            $item_stmt = $this->conn->prepare($item_query);
            $item_stmt->bindParam(":order_id", $row['id']);
            $item_stmt->execute();
            
            $cart = [];
            while ($item_row = $item_stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($cart, $item_row);
            }

            $order = [
                "id" => $row['id'],
                "order_type" => $row['order_type'],
                "customer_name" => $row['customer_name'],
                "customer_mobile" => $row['customer_mobile'],
                "customer_address" => $row['customer_address'],
                "table_number" => $row['table_number'],
                "total" => $row['total'],
                "status" => $row['status'],
                "payment_status" => $row['payment_status'], 
                "payment_method" => $row['payment_method'], 
                "cart" => $cart, 
                "time" => date("h:i A", strtotime($row['created_at'])), 
                "date" => date("d/m/Y", strtotime($row['created_at']))  
            ];
            array_push($orders, $order);
        }
        return $orders;
    }

    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_orders . " SET status=:status WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $status = htmlspecialchars(strip_tags($status));
        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    // 🔥 INVENTORY FUNCTION (Safe SQL aur try-catch ke sath)
    private function deductInventoryStock($menu_item_id, $order_qty) {
        try {
            $query = "SELECT inventory_id, quantity_to_deduct FROM recipes WHERE menu_item_id = :mid";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":mid", $menu_item_id);
            $stmt->execute();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $inventory_id = $row['inventory_id'];
                $total_to_deduct = $row['quantity_to_deduct'] * $order_qty;

                $updateInv = "UPDATE inventory SET stock = stock - :deduct WHERE id = :iid";
                $uStmt = $this->conn->prepare($updateInv);
                $uStmt->bindParam(":deduct", $total_to_deduct);
                $uStmt->bindParam(":iid", $inventory_id);
                $uStmt->execute();
            }
        } catch(PDOException $e) {
            // Error handling (Silent failure for inventory so order still completes)
        }
    }
}
?>