import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";

export default interface OrderDAO {
  getOrder(orderId: string): Promise<any>;
  getOrders(): Promise<any>;
  saveOrderProjection(order: any): Promise<void>;
  updateOrderProjection(order: any): Promise<void>;
  updateDepthProjection(order: any): Promise<void>;
}

export class OrderDAODatabase implements OrderDAO {
  @inject("databaseConnection")
  connection!: DatabaseConnection;

  async getOrder(orderId: string): Promise<any> {
    const [orderData] = await this.connection.query("select * from ccca.order where order_id = $1", [orderId]);
    if (!orderData) throw new Error("Order not found");
    return orderData;
  }

  async getOrders(): Promise<any> {
    const ordersData = await this.connection.query("select * from ccca.order_projection", []);
    return ordersData;
  }

  async saveOrderProjection(order: any): Promise<void> {
    await this.connection.query("insert into ccca.order_projection (order_id, account_id, market_id, name, email, side, quantity, price, status, timestamp, fill_quantity, fill_price) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", [order.orderId, order.accountId, order.marketId, order.name, order.email, order.side, order.quantity, order.price, order.status, order.timestamp, order.fillQuantity, order.fillPrice]);
  }

  async updateOrderProjection(order: any): Promise<void> {
    await this.connection.query("update ccca.order_projection set fill_quantity = $1, fill_price = $2 where order_id = $3", [order.quantity, order.price, order.orderId]);
  }

  async updateDepthProjection(order: UpdateDepthProjectionOrder): Promise<void> {
    const [depth] = await this.connection.query("select * from ccca.depth_projection where market_id = $1 and side = $2 and price = $3", [order.marketId, order.side, order.price]);
    if (depth && order.event === "orderPlaced") {
      const quantity = parseFloat(depth.quantity) + order.quantity;
      await this.connection.query("update ccca.depth_projection set quantity = $1 where market_id = $2 and side = $3 and price = $4", [quantity, order.marketId, order.side, order.price]);
    }
    if (!depth && order.event === "orderPlaced") {
      await this.connection.query("insert into ccca.depth_projection (market_id, side, price, quantity) values ($1, $2, $3, $4)", [order.marketId, order.side, order.price, order.quantity]);
    }
    if (depth && order.event === "orderFilled") {
      const quantity = parseFloat(depth.quantity) - order.quantity;
      await this.connection.query("update ccca.depth_projection set quantity = $1 where market_id = $2 and side = $3 and price = $4", [quantity, order.marketId, order.side, order.price]);
    }
  }
}

type UpdateDepthProjectionOrder = {
  marketId: string,
  side: string,
  price: number,
  quantity: number,
  event: "orderPlaced" | "orderFilled"
}
