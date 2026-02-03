import Book from "../../domain/Book";
import { inject } from "../di/Registry";
import Queue from "../queue/Queue";

export default class BookCache {
  @inject("queue")
  queue!: Queue;
  books: { [marketId: string]: Book } = {};

  getOrCreateBook(marketId: string) {
    if (!this.books[marketId]) {
      const book = new Book(marketId);
      book.register("orderFilled", async (data: any) => {
        console.log("orderFilled");
        // await axios.post("http://localhost:3000/fill_order", data);
        this.queue.publish("orderFilled", data);
      });
      this.books[marketId] = book;
    }
    return this.books[marketId];
  }
}
