const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sessions = [
  ['麗華 -REIKA-', 'host', 'ホスト', '麗華とのツーショット', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop', '2026-03-10', '20:00', '5分', 3000, 10, 7, 4.9, 124, 'NEW'],
  ['星空みゆ', 'idol', 'アイドル', 'みゆとお話しよう', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=200&fit=crop', '2026-03-11', '19:00', '3分', 2000, 20, 15, 4.8, 89, null],
  ['神崎リナ', 'fortune', '占い', 'リナの運命鑑定ツーショット', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop', '2026-03-12', '21:00', '10分', 5000, 5, 3, 5.0, 42, 'POPULAR'],
  ['田中ゆうき', 'english', '英会話', '英語でフリートーク', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop', '2026-03-13', '18:00', '15分', 4000, 8, 8, 4.7, 56, null],
];

async function seed() {
  for (const s of sessions) {
    await pool.query(
      `INSERT INTO booking_sessions (creator, category, category_label, title, avatar, thumbnail, date, time, duration, price, spots_total, spots_left, rating, review_count, tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      s
    );
    console.log('inserted:', s[0]);
  }
  console.log('完了');
  await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });
