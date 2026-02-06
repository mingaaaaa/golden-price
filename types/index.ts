// 黄金价格数据类型
export interface GoldPriceData {
  price: number; // 当前价格
  openPrice: number; // 开盘价
  highPrice: number; // 最高价
  lowPrice: number; // 最低价
  buyPrice: number; // 买入价
  sellPrice: number; // 卖出价
  lastClose: number; // 昨结算价
  changePercent: number; // 涨跌幅（%）
  changeAmount: number; // 涨跌额
  volume?: number; // 成交量（可选）
  time: string; // 数据更新时间 HH:MM:SS
  collectedAt: Date; // 采集时间
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 推送类型
export type PushType = 'hourly' | 'alert' | 'daily' | 'error';

// 预警配置类型
export interface AlertConfigData {
  id?: number;
  highPrice?: number | null;
  lowPrice?: number | null;
  enabled: boolean;
}

// 预警类型
export type AlertType = 'high' | 'low';

// 单个金店价格数据类型
export interface GoldShopBrandPrice {
  brandName: string;
  goldPrice: number;
  platinumPrice?: number;
  barPrice?: number;
  unit: string;
  updateDate: string; // 更新日期（YYYY-MM-DD）
}

// 金店价格记录类型（日期+所有品牌价格）
export interface GoldShopPriceRecord {
  id: number;
  date: string; // YYYY-MM-DD
  prices: GoldShopBrandPrice[];
  collectedAt: Date;
  createdAt: Date;
}

// 今日统计数据类型（包含GoldPrice所有字段 + 统计字段）
export interface TodayStats extends GoldPriceData {
  dayHighPrice: number; // 当天最高价（统计得出）
  dayLowPrice: number; // 当天最低价（统计得出）
  avgPrice: number; // 当天平均价（统计得出）
  createdAt: Date; // 记录创建时间
}
