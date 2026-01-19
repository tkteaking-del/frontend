import React from 'react';
import { Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PriceInfoProps {
  profile: Profile;
}

export const PriceInfo: React.FC<PriceInfoProps> = ({ profile }) => {
  const { isAuthenticated, isSubscribed, user } = useAuth();
  const { price, prices, addonServices, type, userId } = profile;
  const hasAddonServices = addonServices && addonServices.length > 0;

  // 佳麗身份用戶完全看不到價格（無論是否VIP）
  if (user?.role === 'provider') {
    return null;
  }

  // 特選魚市（userId 存在）不顯示價格資訊，價格只在發送訊息彈窗中顯示
  // 如果未登入，完全不顯示價格區塊
  if (userId) {
    // 未登入用戶不顯示特選魚市的價格區塊
    if (!isAuthenticated) {
      return null;
    }
    
    return (
      <div className="mb-10 bg-fun-50/50 p-6 rounded-2xl border border-fun-100 premium-shadow" style={{
        border: '1px solid rgba(26, 95, 63, 0.15)',
        boxShadow: '0 4px 6px -1px rgba(26, 95, 63, 0.1), 0 2px 4px -1px rgba(26, 95, 63, 0.06)'
      }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-serif font-bold text-brand-black">茶種價位</h3>
          <span className="text-brand-yellow text-xs font-black tracking-widest" style={{ color: '#1a5f3f' }}>* 現金交易 / 安全隱私</span>
        </div>
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">請發送訊息查看價格</p>
          <p className="text-sm text-gray-500">點擊「發送訊息」按鈕即可查看完整茶種價位</p>
        </div>
      </div>
    );
  }

  // 嚴選好茶：只有茶客且VIP用戶才能看到價格
  // 如果未登入，完全不顯示價格區塊
  if (!isAuthenticated) {
    return null; // 未登入用戶完全不顯示價格區塊
  }
  
  // 確保只有茶客才能看到價格（佳麗已在上面過濾）
  if (user?.role !== 'client') {
    return null;
  }

  // 判断是否为"私訊詢問"模式
  const isInquiryOnly = price <= 0 || 
    (prices?.oneShot && (prices.oneShot.price <= 0 || prices.oneShot.price === -1));

  const oneShot = prices?.oneShot;
  const twoShot = prices?.twoShot;
  const threeShot = prices?.threeShot;
  
  // 判断是否有多个价格方案
  const hasMultiplePrices = oneShot && twoShot && oneShot.price !== twoShot.price;
  
  // 取得主要價格（優先使用 oneShot，如果沒有則使用 price）
  const mainPrice = oneShot?.price || price;

  return (
    <div className="mb-10 bg-fun-50/50 p-6 rounded-2xl border border-fun-100 premium-shadow" style={{
      border: '1px solid rgba(26, 95, 63, 0.15)',
      boxShadow: '0 4px 6px -1px rgba(26, 95, 63, 0.1), 0 2px 4px -1px rgba(26, 95, 63, 0.06)'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif font-bold text-brand-black">價格方案</h3>
        <span className="text-brand-yellow text-xs font-black tracking-widest" style={{ color: '#1a5f3f' }}>* 現金交易 / 安全隱私</span>
      </div>

      {!isSubscribed ? (
        // 已登入但未購買VIP時顯示提示
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">未聯繫客服</p>
          <p className="text-sm text-gray-500">
            購買VIP會員即可查看完整茶種價位
          </p>
        </div>
      ) : isInquiryOnly ? (
        // 私訊詢問模式
        <div className="space-y-4">
          <div className="mb-4 text-xs text-gray-600">
            <p>
              <strong>💡 價格說明：</strong>
              <br />
              • 詳細價格請私訊客服詢問
              <br />
              {hasAddonServices && (
                <>
                  • 添加配料需額外付費（見下方添加配料列表）
                  <br />
                </>
              )}
              • 客服將為您提供最適合的方案與報價
            </p>
          </div>
          <div className="flex items-center justify-center py-8">
            <button
              onClick={async () => {
                try {
                  // 調用 API 記錄聯繫次數並獲取 Telegram 連結
                  const { profilesApi } = await import('../services/apiService');
                  const result = await profilesApi.recordContact(profile.id);
                  
                  // 如果有 Telegram 連結，優先打開 Telegram 連結
                  if (result.telegramInviteLink) {
                    window.open(result.telegramInviteLink, '_blank', 'noopener,noreferrer');
                  } else {
                    // 否則打開 LINE 連結（後備方案）
                    window.open('https://lin.ee/wPxjsSG', '_blank', 'noopener,noreferrer');
                  }
                } catch (error) {
                  console.error('記錄聯繫次數失敗:', error);
                  // 即使失敗，也打開 LINE 連結
                  window.open('https://lin.ee/wPxjsSG', '_blank', 'noopener,noreferrer');
                }
              }}
              className="px-8 py-4 bg-brand-green text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl inline-block text-center"
              style={{ backgroundColor: '#1a5f3f' }}
            >
              私訊詢問
            </button>
          </div>
        </div>
      ) : (
        // 显示实际价格
        <div className="space-y-4">
          {hasMultiplePrices ? (
            <>
              <div className="text-center mb-4">
                <p className="text-xs text-gray-600 mb-2">底價起</p>
                <p className="text-3xl font-serif font-black text-brand-black">
                  NT$ {mainPrice.toLocaleString()}
                </p>
              </div>
              <div className="space-y-3">
                {oneShot && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{oneShot.desc || '一節/50min/1S'}</span>
                    <span className="text-lg font-bold text-brand-black">NT$ {oneShot.price.toLocaleString()}</span>
                  </div>
                )}
                {twoShot && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{twoShot.desc || '兩節/100min/2S'}</span>
                    <span className="text-lg font-bold text-brand-black">NT$ {twoShot.price.toLocaleString()}</span>
                  </div>
                )}
                {threeShot && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{threeShot.desc}</span>
                    <span className="text-lg font-bold text-brand-black">NT$ {threeShot.price.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-gray-600 mb-2">固定價格</p>
              <p className="text-4xl font-serif font-black text-brand-black">
                NT$ {mainPrice.toLocaleString()}
              </p>
              {oneShot?.desc && (
                <p className="text-sm text-gray-500 mt-2">{oneShot.desc}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 添加配料價格提示 */}
      {hasAddonServices && (
        <div className="mt-4 pt-4 border-t border-fun-100">
          <p className="text-xs text-gray-600">
            <strong>📌 注意：</strong>添加配料價格請在預約時與客服確認，實際價格可能因服務項目而有所不同
          </p>
        </div>
      )}
    </div>
  );
};

