import { sleep } from "../util/sleep";

export default class Retry {

  static async execute(fn: Function, retries: number = 3, timeout: number = 1000): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.log("Retrying");
        await sleep(timeout);
        Retry.execute(fn, retries - 1);
      } else {
        console.log("All retries failed");
      }
    }
  }
}