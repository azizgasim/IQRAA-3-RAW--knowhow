"use client";

import { BoxesMetadata } from "./box-metadata";

export class BoxEngine {
  static getBox(id: number) {
    return BoxesMetadata.find((b) => b.id === id);
  }

  static list() {
    return BoxesMetadata;
  }

  static runBox(id: number, payload: any) {
    const box = this.getBox(id);
    if (!box) return { error: "Box not found." };

    return {
      status: "ok",
      box: box.name,
      received: payload,
      next: box.feeds_into,
      metadata: box,
    };
  }
}
