require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Reflect origin so credentials: true works without browser wildcard errors
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Allow both websocket and polling transports
  transports: ["websocket", "polling"],
});

const INTERNAL_SOCKET_SECRET =
  process.env.INTERNAL_SOCKET_SECRET || "quickibite_internal_secret_2026";

// ── HTTP Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const rooms = [];
  io.sockets.adapter.rooms.forEach((_, key) => rooms.push(key));
  res.json({
    status: "OK",
    timestamp: new Date(),
    connected_clients: io.engine.clientsCount,
    rooms,
  });
});

// ── HTTP trigger from PHP backend (secured with shared secret) ─────────────────
app.post("/trigger-order", (req, res) => {
  const incomingSecret =
    req.headers["x-internal-secret"] ||
    (req.headers["authorization"] &&
      req.headers["authorization"].replace(/^Bearer\s+/i, ""));

  if (!incomingSecret || incomingSecret !== INTERNAL_SOCKET_SECRET) {
    console.warn(`⛔ Unauthorized HTTP trigger attempt from ${req.ip || "unknown IP"}`);
    return res.status(403).json({
      success: false,
      message: "Unauthorized internal trigger",
    });
  }

  const payload = req.body || {};
  console.log("📦 Authorized HTTP trigger received from PHP backend → broadcasting events:", payload);
  io.emit("refresh_kitchen", payload);
  io.emit("refresh_orders", payload);
  io.emit("refresh_rider", payload);
  io.emit("order_status_updated", payload);
  if (payload.type === "menu_updated") {
    io.emit("refresh_menu", payload);
  }
  res.json({ success: true, message: "Events broadcast via HTTP trigger" });
});

// ── Socket.io Connection Guard ────────────────────────────────────────────────
io.use((socket, next) => {
  next();
});

// ── Socket.io events ───────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`👤 Client connected: ${socket.id}`);

  // Client joins a named room (e.g. "kitchen")
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`📋 ${socket.id} joined room: "${room}"`);
  });

  // 🔥 Kitchen changed an order status (Cooking / Ready / Delivered)
  // Dispatcher listens to refresh_kitchen to show newly Ready delivery orders
  socket.on("order_status_changed", () => {
    console.log(`🍳 Order status changed by kitchen ${socket.id} → notifying dispatcher`);
    io.emit("refresh_kitchen"); // Dispatcher + any admin panels refresh
  });

  // 🔥 Rider completed a delivery → update dispatcher immediately
  socket.on("order_delivered", () => {
    console.log(`✅ Order delivered by rider ${socket.id} → refreshing dispatcher`);
    io.emit("refresh_kitchen");    // Dispatcher re-fetches all orders (Dispatched trip disappears)
    io.emit("refresh_rider_list"); // Rider shows as Available again
  });

  // 🔥 NEW ORDER from customer website or cashier POS
  socket.on("new_order_placed", () => {
    console.log(`📢 new_order_placed from ${socket.id} → broadcasting to kitchen & dispatcher`);
    io.emit("refresh_kitchen"); // Kitchen + Dispatcher both listen to this
  });

  // Dispatcher assigns order to rider → notify all riders
  socket.on("trigger_rider_assignment", (data) => {
    console.log("📬 Rider assignment triggered → notifying riders", data || "");
    io.emit("refresh_rider", data);          // Rider portal listens
    io.emit("refresh_rider_list", data);     // Dispatcher rider list refreshes
    io.emit("trigger_rider_assignment", data);
  });

  // Rider status changes (online/offline/complete delivery)
  socket.on("rider_status_update", () => {
    console.log("🚴 Rider status updated → refreshing dispatcher");
    io.emit("refresh_rider_list");     // Dispatcher updates rider availability
    io.emit("refresh_kitchen");        // Admin orders panel update
  });

  // 💰 Cashier updated payment status or reconciled rider COD
  socket.on("payment_status_updated", (data) => {
    console.log(`💰 Payment status updated by ${socket.id} → broadcasting to clients`, data || "");
    io.emit("refresh_kitchen");
    io.emit("refresh_orders");
    io.emit("payment_status_updated", data);
  });

  // 📍 Rider GPS stream → dispatchers, customers, and order-specific rooms
  socket.on("rider_location_update", (data) => {
    if (!data) return;
    const targetOrderId = data.order_id || data.orderId || (data.order && data.order.id);
    const lat = data.latitude ?? data.lat;
    const lng = data.longitude ?? data.lng;

    console.log(`📍 Rider location update received for Order #${targetOrderId || 'ALL'}: lat=${lat}, lng=${lng}, heading=${data.heading || data.bearing || 0}°`);

    // Broadcast to dispatcher room and global listeners
    socket.to("dispatcher").emit("rider_location_broadcast", data);
    io.emit("rider_location_broadcast", data);
    io.emit("rider_location_update", data);

    // If linked to an order, broadcast to order-specific room & event
    if (targetOrderId) {
      io.emit(`order_tracking_${targetOrderId}`, data);
      io.emit(`order_tracking_${String(targetOrderId)}`, data);
      io.to(`order_${targetOrderId}`).emit("rider_location_update", data);
    }
  });

  // 🔄 Generic order status updated broadcast
  socket.on("order_status_updated", (data) => {
    console.log("🔄 order_status_updated received → broadcasting to all clients", data || "");
    io.emit("order_status_updated", data);
    io.emit("refresh_kitchen");
    io.emit("refresh_orders", data);
  });

  // 🔄 Manual refresh triggers
  socket.on("refresh_kitchen", () => {
    io.emit("refresh_kitchen");
  });

  socket.on("refresh_rider_list", () => {
    io.emit("refresh_rider_list");
  });

  socket.on("refresh_rider", (data) => {
    io.emit("refresh_rider", data);
  });

  socket.on("refresh_orders", (data) => {
    io.emit("refresh_orders", data);
  });

  // 🌉 Legacy / alias bridges for dead events
  socket.on("order:ready", (data) => {
    io.emit("order_status_updated", { ...data, status: "ready" });
    io.emit("refresh_kitchen");
  });

  socket.on("order:dispatched", (data) => {
    io.emit("order_status_updated", { ...data, status: "dispatched" });
    io.emit("refresh_kitchen");
  });

  socket.on("order:delivered", (data) => {
    io.emit("order_status_updated", { ...data, status: "delivered" });
    io.emit("refresh_kitchen");
    io.emit("refresh_rider_list");
  });

  socket.on("new_order", (data) => {
    io.emit("new_order_placed", data);
    io.emit("refresh_kitchen");
  });

  socket.on("disconnect", (reason) => {
    console.log(`👋 Client disconnected: ${socket.id} — reason: ${reason}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket Server running on port ${PORT} [${NODE_ENV}]`);
  console.log(
    `   CORS Origin: ${
      NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PRODUCTION
        : process.env.FRONTEND_URL || "*"
    }`
  );
});
