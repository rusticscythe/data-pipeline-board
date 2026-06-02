import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export default function getDb() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}
