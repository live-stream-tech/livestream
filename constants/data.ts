export type Video = {
  id: string;
  title: string;
  creator: string;
  community: string;
  views: number;
  timeAgo: string;
  duration: string;
  price: number | null;
  thumbnail: string;
  avatar: string;
  rank?: number;
};

export type LiveStream = {
  id: string;
  title: string;
  creator: string;
  community: string;
  viewers: number;
  thumbnail: string;
  avatar: string;
  timeAgo: string;
};

export type Community = {
  id: string;
  name: string;
  members: number;
  thumbnail: string;
  online: boolean;
  category: string;
};

export type Creator = {
  id: string;
  name: string;
  community: string;
  avatar: string;
  rank: number;
  heatScore: number;
  totalViews: number;
  revenue: number;
  streamCount: number;
  followers: number;
  revenueShare: number;
};

export const VIDEOS: Video[] = [
  {
    id: "1",
    title: "新曲制作の裏側",
    creator: "JPOP界隈",
    community: "JPOP界隈",
    views: 3421,
    timeAgo: "2時間前",
    duration: "12:34",
    price: 500,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
  },
  {
    id: "2",
    title: "アコースティックライブ【無料公開】",
    creator: "JPOP界隈",
    community: "JPOP界隈",
    views: 4532,
    timeAgo: "5時間前",
    duration: "18:22",
    price: null,
    thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
  },
  {
    id: "3",
    title: "ショパン エチュード解説",
    creator: "ピアノ界隈",
    community: "ピアノ界隈",
    views: 2891,
    timeAgo: "7時間前",
    duration: "24:15",
    price: 400,
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
  },
  {
    id: "4",
    title: "スーパーカー試乗レビュー【無料】",
    creator: "車好き界隈",
    community: "車好き界隈",
    views: 5234,
    timeAgo: "4時間前",
    duration: "31:42",
    price: null,
    thumbnail: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
  },
];

export const LIVE_STREAMS: LiveStream[] = [
  {
    id: "1",
    title: "【生配信】新曲初披露＆チェキ当たる抽選会",
    creator: "星空みゆ",
    community: "地下アイドル界隈",
    viewers: 3453,
    thumbnail: "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    timeAgo: "30分前から配信中",
  },
  {
    id: "2",
    title: "放課後雑談配信：質問答えるよ〜",
    creator: "まいまい17歳",
    community: "JK日常界隈",
    viewers: 2821,
    thumbnail: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop",
    timeAgo: "15分前から配信中",
  },
  {
    id: "3",
    title: "【メイク配信】今日の同伴前メイク見せちゃう",
    creator: "麗華 -REIKA-",
    community: "キャバ嬢・ホスト界隈",
    viewers: 4176,
    thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=50&h=50&fit=crop",
    timeAgo: "45分前から配信中",
  },
  {
    id: "4",
    title: "【生コント】視聴者お題で即興ネタやります",
    creator: "コンビ芸人「ダブルパンチ」",
    community: "お笑い芸人界隈",
    viewers: 5245,
    thumbnail: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    timeAgo: "20分前から配信中",
  },
  {
    id: "5",
    title: "稽古場からLIVE配信",
    creator: "劇団ほしぞら",
    community: "演劇界隈",
    viewers: 1823,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop",
    timeAgo: "10分前から配信中",
  },
];

export const RANKED_VIDEOS: Video[] = [
  {
    id: "r1",
    rank: 1,
    title: "MVメイキング映像",
    creator: "JPOP界隈",
    community: "JPOP界隈",
    views: 45234,
    timeAgo: "1週間前",
    duration: "24:15",
    price: 800,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
  },
  {
    id: "r2",
    rank: 2,
    title: "世界の名車ツアー完全版",
    creator: "車好き界隈",
    community: "車好き界隈",
    views: 38921,
    timeAgo: "5日前",
    duration: "48:30",
    price: 1200,
    thumbnail: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
  },
  {
    id: "r3",
    rank: 3,
    title: "リスト超絶技巧練習曲集",
    creator: "ピアノ界隈",
    community: "ピアノ界隈",
    views: 32156,
    timeAgo: "3日前",
    duration: "18:22",
    price: 600,
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
  },
];

export const COMMUNITIES: Community[] = [
  {
    id: "1",
    name: "地下アイドル界隈",
    members: 185000,
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
    online: true,
    category: "音楽",
  },
  {
    id: "2",
    name: "キャバ嬢・ホスト界隈",
    members: 167000,
    thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
    online: true,
    category: "ライフスタイル",
  },
  {
    id: "3",
    name: "JPOP界隈",
    members: 125000,
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    online: false,
    category: "音楽",
  },
  {
    id: "4",
    name: "JK日常界隈",
    members: 142000,
    thumbnail: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop",
    online: false,
    category: "ライフスタイル",
  },
  {
    id: "5",
    name: "お笑い芸人界隈",
    members: 98000,
    thumbnail: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop",
    online: true,
    category: "アート",
  },
  {
    id: "6",
    name: "ピアノ界隈",
    members: 89000,
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop",
    online: false,
    category: "音楽",
  },
];

export const CREATORS: Creator[] = [
  {
    id: "1",
    rank: 1,
    name: "星空みゆ",
    community: "地下アイドル界隈",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    heatScore: 1090.1,
    totalViews: 185320,
    revenue: 173000,
    streamCount: 34,
    followers: 48000,
    revenueShare: 80,
  },
  {
    id: "2",
    rank: 2,
    name: "コンビ芸人「ダブルパンチ」",
    community: "お笑い芸人界隈",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    heatScore: 923.5,
    totalViews: 172450,
    revenue: 119000,
    streamCount: 45,
    followers: 92000,
    revenueShare: 80,
  },
  {
    id: "3",
    rank: 3,
    name: "麗華 -REIKA-",
    community: "キャバ嬢・ホスト界隈",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop",
    heatScore: 1414.0,
    totalViews: 164800,
    revenue: 165000,
    streamCount: 52,
    followers: 67000,
    revenueShare: 80,
  },
  {
    id: "4",
    rank: 4,
    name: "まいまい17歳",
    community: "JK日常界隈",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    heatScore: 865.7,
    totalViews: 148900,
    revenue: 85500,
    streamCount: 68,
    followers: 52000,
    revenueShare: 80,
  },
];

export const FOLLOWING_FEED = [
  {
    id: "1",
    creator: "星空みゆ",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    content: "明日のワンマンライブのリハ終わった！みんなに会えるの楽しみすぎる",
    timeAgo: "2時間前",
  },
  {
    id: "2",
    creator: "まいまい17歳",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop",
    content: "今日テストだったけど全然できんかった 放課後プリクラ行って気分転換",
    timeAgo: "6時間前",
  },
  {
    id: "3",
    creator: "コンビ芸人「ダブルパンチ」",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    content: "新ネタ完成！今週末の劇場で初披露します。絶対笑わせる自信ある",
    timeAgo: "8時間前",
  },
];
