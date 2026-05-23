import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const projectRef = 'qrwlpvrvmjvaxesxvpkp'
const password = process.env.SUPABASE_DB_PASSWORD

if (!password) {
  console.error('SUPABASE_DB_PASSWORD 환경 변수가 필요합니다.')
  process.exit(1)
}

const sqlPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../supabase/migrations/001_memos.sql',
)
const sql = fs.readFileSync(sqlPath, 'utf8')

const hosts = [
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
  {
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
  },
  {
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: `postgres.${projectRef}`,
  },
]

let client
let lastError

for (const { host, port, user } of hosts) {
  const candidate = new pg.Client({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
  })
  try {
    await candidate.connect()
    client = candidate
    console.log(`Connected: ${host}:${port}`)
    break
  } catch (err) {
    lastError = err
    await candidate.end().catch(() => {})
  }
}

if (!client) {
  console.error('Migration failed:', lastError?.message ?? 'no connection')
  process.exit(1)
}

try {
  await client.query(sql)
  console.log('Migration applied: public.memos')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
