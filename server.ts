import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/order", (req, res) => {
    const order = req.body;
    
    // In a real scenario, we would use nodemailer or a service like Resend here.
    // For this demonstration, we'll log the order which would be sent as an email.
    console.log("------------------------------------------");
    console.log("NOVO PEDIDO RECEBIDO");
    console.log(`Cliente: ${order.customerName}`);
    console.log(`Telefone: ${order.customerPhone}`);
    console.log("Itens:");
    order.items.forEach((item: any) => {
      console.log(`- ${item.name}: ${item.quantity}un`);
    });
    console.log(`Total de Trufas: ${order.totalQuantity}`);
    console.log(`Valor Total: R$ ${order.totalPrice.toFixed(2)}`);
    console.log(`Economia: R$ ${order.savings.toFixed(2)}`);
    console.log("------------------------------------------");

    res.status(200).json({ 
      success: true, 
      message: "Pedido enviado com sucesso! Entraremos em contato." 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
