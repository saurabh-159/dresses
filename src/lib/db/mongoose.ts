import { createRequire } from "node:module";
import mongoose from "mongoose";

const nodeRequire = createRequire(import.meta.url);
const dns = nodeRequire("node:dns") as typeof import("node:dns");

function usePublicDns() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

usePublicDns();

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

async function connectionUri() {
  if (!MONGODB_URI.startsWith("mongodb+srv://")) {
    return MONGODB_URI;
  }

  const remainder = MONGODB_URI.slice("mongodb+srv://".length);
  const slash = remainder.indexOf("/");
  const question = remainder.indexOf("?");
  const hostEnd =
    slash === -1
      ? question === -1
        ? remainder.length
        : question
      : question === -1
        ? slash
        : Math.min(slash, question);

  const authAndHost = remainder.slice(0, hostEnd);
  const at = authAndHost.lastIndexOf("@");
  const auth = at === -1 ? "" : authAndHost.slice(0, at + 1);
  const host = authAndHost.slice(at + 1);
  const records = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`).catch(async () => {
    usePublicDns();
    return dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  });
  const hosts = records.map((record) => `${record.name}:${record.port}`).join(",");
  const txt = await dns.promises.resolveTxt(host).catch(() => [] as string[][]);
  const params = new URLSearchParams(txt.flat().join("&"));

  if (question !== -1) {
    const extra = new URLSearchParams(remainder.slice(question + 1));
    extra.forEach((value, key) => params.set(key, value));
  }

  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }

  return `mongodb://${auth}${hosts}/?${params.toString()}`;
}

export async function connectDB() {
  usePublicDns();

  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  cached.conn = null;

  if (!cached.promise) {
    cached.promise = connectionUri().then((uri) =>
      mongoose.connect(uri, {
        dbName: "dresses",
        family: 4,
        serverSelectionTimeoutMS: 10000,
      })
    );
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    const message = error instanceof Error ? error.message : "Database connection failed";
    if (/whitelist|alert number 80|tlsv1 alert internal error/i.test(message)) {
      throw new Error(
        "MongoDB Atlas blocked this computer. Open Atlas Network Access, add your current IP address, then restart the dev server."
      );
    }
    throw new Error(message);
  }

  return cached.conn;
}

export default connectDB;