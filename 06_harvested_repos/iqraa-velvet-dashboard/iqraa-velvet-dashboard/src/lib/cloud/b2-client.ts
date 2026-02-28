import fs from "fs";
import path from "path";

const MOCK_DIR = path.join(process.cwd(), "memory", "mock-cloud");

// Ensure mock dir exists
if (!fs.existsSync(MOCK_DIR)) {
  fs.mkdirSync(MOCK_DIR, { recursive: true });
}

export const b2Client = {
  async uploadFile(bucket: string, filename: string, data: any) {
    const filePath = path.join(MOCK_DIR, `${bucket}__${filename}.json`);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    return {
      success: true,
      bucket,
      filename,
      path: filePath,
    };
  },

  async downloadFile(bucket: string, filename: string) {
    const filePath = path.join(MOCK_DIR, `${bucket}__${filename}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  },

  async listMockCloud() {
    return fs.readdirSync(MOCK_DIR);
  }
};
