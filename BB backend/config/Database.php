<?php
class Database {
    private $host;
    private $port = "3306"; 
    private $db_name;
    private $username;
    private $password;

    public $conn; 

    public function __construct() {
        // Auto-detect environment: Alwaysdata vs Local XAMPP
        $hostHeader = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? '');
        $isAlwaysdata = (strpos($hostHeader, 'alwaysdata.net') !== false) || (getenv('ALWAYSDATA_HTTPD_PORT') !== false);

        if ($isAlwaysdata) {
            // Alwaysdata Cloud Database
            $this->host = "mysql-quickibite.alwaysdata.net";
            $this->port = "3306"; 
            $this->db_name = "quickibite_db";
            $this->username = "quickibite";
            $this->password = "Quickbite123;";
        } else {
            // Local XAMPP Environment
            $this->host = "127.0.0.1";
            $this->port = "3306"; 
            $this->db_name = "restaurant_db";
            $this->username = "root";
            $this->password = "";
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode(["success" => false, "message" => "Database connection error: " . $exception->getMessage()]);
            exit();
        }
        return $this->conn;
    }
}
?>