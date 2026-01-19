import React, { useState, useMemo, useEffect } from 'react';
import { Profile, Review, ForumPost } from '../types';
import { PriceInfo } from './PriceInfo';
import { reviewsApi, forumApi, profilesApi } from '../services/apiService';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import { BookingModal } from './BookingModal';
import { MessageModal } from './MessageModal';
import { useAuth } from '../contexts/AuthContext';
import { formatText } from '../utils/textFormatter';
import { MembershipBenefitsInfo } from './MembershipBenefitsInfo';
import { getMaxGalleryPhotoCount } from '../utils/membershipBenefits';
import { MembershipLevel } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { ProviderVerifiedBadge } from './ProviderVerifiedBadge';
import { EmailVerifiedBadge } from './EmailVerifiedBadge';
import { getImageUrl, OFFICIAL_LINE_URL } from '../config/api';

interface ProfileDetailProps {
  profile: Profile;
  onBack: () => void;
}

const ServiceIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="flex items-center gap-3 mb-3 min-w-[30%]">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center" style={{ color: '#1a5f3f' }}>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
             <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      </div>
      <span className="text-sm text-gray-700 font-medium">{name}</span>
    </div>
  );
};

// 社群平台圖標組件
const SocialPlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const platformLower = platform.toLowerCase();
  const iconSize = 20;
  
  if (platformLower.includes('x') || platformLower.includes('twitter')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  
  if (platformLower.includes('instagram') || platformLower.includes('ig')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  
  if (platformLower.includes('facebook') || platformLower.includes('fb')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  
  if (platformLower.includes('whatsapp')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    );
  }
  
  if (platformLower.includes('onlyfans')) {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-pink-600">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    );
  }
  
  // 預設圖標（鏈接）
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<ForumPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { userStatus, isAuthenticated, user } = useAuth();
  const [providerUser, setProviderUser] = useState<any>(null); // 存儲 provider 的用戶資訊

  // 計算可查看的照片數量（僅嚴選好茶，包括寫真照片和作品集）
  const maxPhotoCount = useMemo(() => {
    // 僅對嚴選好茶（!profile.userId）應用限制
    if (profile.userId) {
      return -1; // 特選魚市不限制
    }
    
    if (!isAuthenticated || !user) {
      return 0; // 未登入用戶無法查看
    }
    
    return getMaxGalleryPhotoCount(
      user.membershipLevel as MembershipLevel | undefined,
      user.isVip || false
    );
  }, [profile.userId, isAuthenticated, user]);

  const displayImages = useMemo(() => {
    if (activeTab === 'All') {
        const allImages = new Set<string>();
        if (profile.gallery) profile.gallery.forEach(img => allImages.add(img));
        if (profile.albums) {
            profile.albums.forEach(album => album.images.forEach(img => allImages.add(img)));
        }
        return Array.from(allImages);
    } else {
        const album = profile.albums?.find(a => a.category === activeTab);
        return album ? album.images : [];
    }
  }, [profile, activeTab]);

  const tabs = useMemo(() => {
     const t = ['All'];
     if (profile.albums) {
         profile.albums.forEach(a => t.push(a.category));
     }
     return t;
  }, [profile]);

  const openLightbox = (index: number) => {
      setLightboxIndex(index);
      document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
      setLightboxIndex(null);
      document.body.style.overflow = 'auto';
  };

  // 載入 Profile 詳情和 Provider 用戶資訊（觸發瀏覽任務）
  useEffect(() => {
    const loadProfileDetail = async () => {
      try {
        // 調用後端 API 獲取 Profile，這會觸發瀏覽任務
        const updatedProfile = await profilesApi.getById(profile.id);
        // 如果後端返回的數據與本地不同，可以選擇更新（但這裡我們主要目的是觸發任務）
        if (import.meta.env.DEV) {
          console.log('Profile 詳情已載入，瀏覽任務已觸發');
        }
        
        // 如果是特選魚市（有 userId），載入 Provider 用戶資訊
        if (profile.userId) {
          try {
            const { authApi } = await import('../services/apiService');
            const userData = await authApi.getUserProfile(profile.userId);
            setProviderUser(userData);
          } catch (userError) {
            // 靜默失敗，不影響顯示
            if (import.meta.env.DEV) {
              console.warn('載入 Provider 用戶資訊失敗:', userError);
            }
          }
        }
      } catch (error) {
        console.error('載入 Profile 詳情失敗:', error);
        // 即使失敗也不影響顯示，因為我們已經有 profile prop
      }
    };
    
    loadProfileDetail();
  }, [profile.id, profile.userId]);

  // 載入評論
  useEffect(() => {
    loadReviews();
  }, [profile.id]);

  // 載入相關茶帖
  useEffect(() => {
    loadRelatedPosts();
  }, [profile.id]);

  const loadRelatedPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await forumApi.getPosts({ limit: 5 });
      // 過濾出關聯此 Profile 的茶帖
      const related = data.posts.filter(post => post.relatedProfileId === profile.id);
      setRelatedPosts(related);
    } catch (error) {
      console.error('載入相關茶帖失敗:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await reviewsApi.getByProfileId(profile.id);
      // 後端已經根據等級和VIP狀態返回對應數量的評論
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.total);
      
      // 檢查是否有更多評論（如果返回的評論數少於總數，表示還有更多）
      const hasMore = data.total > data.reviews.length;
      if (!hasMore) {
        setShowAllReviews(true); // 如果已經顯示全部，設置為已展開
      }
    } catch (error) {
      console.error('載入評論失敗:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReviewSubmit = () => {
    loadReviews();
  };

  // 根據權限顯示評論
  // 後端已經根據等級和VIP狀態返回對應數量的評論
  // 這裡直接使用返回的評論，不需要再次切片
  const getVisibleReviews = (): Review[] => {
    if (userStatus === 'guest') return [];
    // 後端已經根據等級和VIP狀態返回對應數量的評論
    // 如果 showAllReviews 為 true，表示用戶想查看全部（但後端可能只返回部分）
    return reviews;
  };

  const visibleReviews = getVisibleReviews();
  // 檢查是否有更多評論（如果返回的評論數少於總數，表示還有更多）
  const hasMoreReviews = totalReviews > reviews.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-4 md:p-8">
        <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
          <button onClick={onBack} className="transition-colors" style={{ '--hover-color': '#1a5f3f' } as React.CSSProperties} onMouseEnter={(e) => e.currentTarget.style.color = '#1a5f3f'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>HOME</button>
          <span>/</span>
          <span className="text-brand-black">{profile.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="w-full aspect-[3/4] rounded-2xl bg-gray-100 relative group overflow-hidden shadow-xl border border-gray-100">
               <img src={getImageUrl(profile.imageUrl)} alt={profile.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
               {/* 驗證勳章 - 只有特選魚市（有 userId）才顯示 */}
               {profile.userId && (
                 <div className="absolute top-4 left-4">
                   {providerUser?.isVip ? (
                     <div 
                       className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                       }}
                       title="佳麗驗證勳章（VIP）"
                     >
                       <svg 
                         className="w-6 h-6 text-white" 
                         fill="currentColor" 
                         viewBox="0 0 24 24"
                       >
                         {/* 五瓣花朵圖標 */}
                         <path d="M12 2l2.5 7.5L22 10l-5.5 4.5L18 22l-6-4.5L6 22l1.5-7.5L2 10l7.5-.5L12 2z"/>
                       </svg>
                     </div>
                   ) : providerUser?.emailVerified ? (
                     <span className="bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg">✓ 已驗證</span>
                   ) : null}
                 </div>
               )}
               {/* 收藏按鈕 - 嚴選好茶和特選魚市都可以收藏，且僅限茶客 */}
               {isAuthenticated && user?.role === 'client' && (
                 <div className="absolute top-4 right-4 z-20">
                   <FavoriteButton profileId={profile.id} />
                 </div>
               )}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="mb-8 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-serif font-bold text-brand-black">{profile.name}</h1>
                <span className="text-3xl">{profile.nationality}</span>
              </div>
              <p className="text-gray-500 text-sm font-bold tracking-widest mb-4 flex items-center gap-2">
                 📍 {profile.location} {profile.district && <span style={{ color: '#1a5f3f' }}>• {profile.district}</span>}
              </p>
              
              <div className="flex flex-wrap gap-2">
                  {(profile.tags || []).map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black tracking-widest uppercase rounded-md">{tag}</span>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-10">
               <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Age</div>
                   <div className="font-serif font-black text-xl text-brand-black">{profile.age}</div>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Height</div>
                   <div className="font-serif font-black text-xl text-brand-black">{profile.height}</div>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Weight</div>
                   <div className="font-serif font-black text-xl text-brand-black">{profile.weight}</div>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Cup</div>
                   <div className="font-serif font-black text-xl text-brand-black">{profile.cup}</div>
               </div>
            </div>

            <PriceInfo profile={profile} />

            {profile.addonServices && profile.addonServices.length > 0 && (
              <div className="mb-10 animate-fade-in-up">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">💎 添加配料</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.addonServices.map((addon, idx) => (
                    <span key={idx} className="text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg" style={{ backgroundColor: '#1a5f3f', boxShadow: '0 4px 6px -1px rgba(26, 95, 63, 0.3)' }}>
                      {addon}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.basicServices && profile.basicServices.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">茶種可契合活動</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {profile.basicServices
                    .filter(service => !service.startsWith('備註：'))
                    .map((service, idx) => (
                      <ServiceIcon key={idx} name={service} />
                    ))}
                </div>
                {/* 補充訊息（備註） */}
                {profile.basicServices.find(service => service.startsWith('備註：')) && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">補充訊息</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {profile.basicServices.find(service => service.startsWith('備註：'))?.replace('備註：', '')}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
               {profile.userId ? (
                 // 特選魚市：顯示「發送訊息」按鈕
                 <button
                   onClick={async () => {
                     if (!isAuthenticated) {
                       alert('請先登入才能發送訊息');
                       return;
                     }
                     if (user?.role === 'provider') {
                       alert('後宮佳麗無法發送訊息給其他佳麗');
                       return;
                     }
                     
                     // 重新獲取最新的用戶狀態，確保 emailVerified 狀態是最新的
                     try {
                       const { authApi } = await import('../services/apiService');
                       const currentUser = await authApi.getMe();
                       if (!currentUser.emailVerified) {
                         alert('請先完成 Email 驗證才能發送訊息');
                         return;
                       }
                       setShowMessageModal(true);
                     } catch (error: any) {
                       // 如果獲取失敗，使用緩存的 user 狀態
                       if (!user?.emailVerified) {
                         alert('請先完成 Email 驗證才能發送訊息');
                         return;
                       }
                       setShowMessageModal(true);
                     }
                   }}
                   className="premium-button text-white text-lg font-black tracking-[0.2em] py-5 px-8 rounded-2xl w-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="group-hover:rotate-12 transition-transform" viewBox="0 0 16 16">
                     <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                   </svg>
                   發送訊息
                 </button>
               ) : (
                 // 嚴選好茶：顯示「立即約會品茶諮詢」按鈕，直接導向官方 Line 連結
                 <a
                   href={OFFICIAL_LINE_URL}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="premium-button text-white text-lg font-black tracking-[0.2em] py-5 px-8 rounded-2xl w-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group"
                   style={{ textDecoration: 'none', display: 'block' }}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="group-hover:rotate-12 transition-transform" viewBox="0 0 16 16">
                     <path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.998-1.114 3.86-2.99 5.063.344.975 1.155 2.102 1.173 2.13.045.07.026.162-.04.214-.035.027-.08.038-.122.028-.88-.224-2.616-.76-3.414-1.127C1.868 14.335 0 10.74 0 6.492 0 2.912 3.589 0 8 0z"/>
                   </svg>
                   立即約會品茶諮詢
                 </a>
               )}
               <p className="text-center text-[10px] text-gray-300 font-bold tracking-[0.3em] uppercase mt-4">24/7 Premium Concierge Service</p>
            </div>
          </div>
        </div>

        {/* 作品影片（僅嚴選好茶） */}
        {!profile.userId && profile.videos && profile.videos.length > 0 && (
          <div className="mt-20 border-t border-gray-100 pt-12">
            <h3 className="text-3xl font-serif font-black text-brand-black mb-8">作品影片</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.videos.map((video, idx) => {
                // 判斷是否應該模糊處理（應用與寫真照片相同的限制）
                const isBlurred = maxPhotoCount !== -1 && idx >= maxPhotoCount;
                const canView = maxPhotoCount === -1 || idx < maxPhotoCount;
                
                return (
                  <div 
                    key={idx} 
                    className={`bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 group ${
                      canView ? 'hover:shadow-xl cursor-pointer' : 'cursor-not-allowed opacity-75'
                    }`}
                  >
                    {/* 縮略圖 */}
                    {video.thumbnail ? (
                      <div className={`relative w-full h-48 bg-gray-100 overflow-hidden ${isBlurred ? 'blur-md' : ''}`}>
                        <img 
                          src={getImageUrl(video.thumbnail)} 
                          alt={video.title || video.code || 'Video thumbnail'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={isBlurred ? { filter: 'blur(20px)' } : {}}
                          onError={(e) => {
                            // 如果圖片載入失敗，隱藏圖片容器
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded">
                          {video.code || 'VIDEO'}
                        </div>
                        {isBlurred && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                              <svg className="w-12 h-12 mx-auto mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <p className="text-sm font-bold">升級會員等級解鎖</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${isBlurred ? 'blur-md' : ''}`}>
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {video.code && (
                            <div className="text-xs font-bold text-gray-500">{video.code}</div>
                          )}
                        </div>
                        {isBlurred && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                              <svg className="w-12 h-12 mx-auto mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <p className="text-sm font-bold">升級會員等級解鎖</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* 內容區域 */}
                    <div className="p-4">
                      {video.code && !video.thumbnail && (
                        <div className="text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">番號：{video.code}</div>
                      )}
                      {video.title && (
                        <h4 className="text-base font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3rem]">{video.title}</h4>
                      )}
                      {canView ? (
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block w-full py-3 px-6 bg-brand-green text-white rounded-lg font-bold text-center hover:bg-opacity-90 transition-colors"
                          style={{ backgroundColor: '#1a5f3f' }}
                        >
                          觀看影片 →
                        </a>
                      ) : (
                        <button
                          onClick={() => alert('升級會員等級可查看更多作品影片')}
                          className="block w-full py-3 px-6 bg-gray-300 text-gray-600 rounded-lg font-bold text-center cursor-not-allowed"
                          disabled
                        >
                          升級解鎖 →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 聯絡方式與預約流程（僅特選鮮魚） */}
        {profile.userId && (profile.contactInfo?.socialAccounts || profile.bookingProcess) && (
          <div className="mt-20 border-t border-gray-100 pt-12">
            <h3 className="text-3xl font-serif font-black text-brand-black mb-8">聯絡方式與約會品茶流程</h3>
            
            {/* 社群帳號 */}
            {profile.contactInfo?.socialAccounts && Object.keys(profile.contactInfo.socialAccounts).length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-700 mb-4">社群帳號</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(profile.contactInfo.socialAccounts).map(([platform, value]) => {
                    const valueStr = String(value);
                    const url = valueStr.startsWith('http') ? valueStr : `https://${valueStr}`;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-brand-green hover:shadow-md transition-all flex items-center gap-2"
                        style={{ '--hover-border-color': '#1a5f3f' } as React.CSSProperties}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <SocialPlatformIcon platform={platform} />
                        <span className="font-semibold text-gray-700">{platform}</span>
                        <span className="text-sm text-gray-500 truncate max-w-[150px]">{valueStr}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* 預約流程 */}
            {profile.bookingProcess && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-700 mb-4">約會品茶流程</h4>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {profile.bookingProcess}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-20 border-t border-gray-100 pt-12">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <h3 className="text-3xl font-serif font-black text-brand-black mb-4 md:mb-0">茶種示意圖</h3>
                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === tab ? 'bg-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                            style={activeTab === tab ? { color: '#1a5f3f' } : {}}
                        >
                            {tab === 'All' ? '全部' : tab}
                        </button>
                    ))}
                </div>
             </div>
             
             {displayImages.length === 0 ? (
                 <div className="text-center py-20 bg-gray-50 rounded-[2rem] text-gray-400 font-bold border-2 border-dashed border-gray-100">暫無照片展示</div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {displayImages.map((img, idx) => {
                      // 判斷是否應該模糊處理（僅嚴選好茶）
                      const isBlurred = !profile.userId && maxPhotoCount !== -1 && idx >= maxPhotoCount;
                      const canView = !profile.userId && maxPhotoCount !== -1 && idx >= maxPhotoCount ? false : true;
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (canView) {
                              openLightbox(idx);
                            } else {
                              // 提示用戶需要升級
                              alert('升級會員等級可查看更多寫真照片');
                            }
                          }} 
                          className={`aspect-[3/4] rounded-2xl overflow-hidden relative group border border-gray-50 shadow-sm hover:shadow-xl transition-all ${
                            canView ? 'cursor-pointer' : 'cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-full h-full relative ${isBlurred ? 'blur-md' : ''}`}>
                            <img 
                              src={getImageUrl(img)} 
                              alt={`Gallery ${idx}`} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              loading="lazy" 
                              decoding="async"
                              style={isBlurred ? { filter: 'blur(20px)' } : {}}
                            />
                            {isBlurred && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white px-4">
                                  <svg className="w-12 h-12 mx-auto mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <p className="text-sm font-bold">升級會員等級解鎖</p>
                                </div>
                              </div>
                            )}
                          </div>
                          {canView && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          )}
                        </div>
                      );
                    })}
                </div>
             )}
        </div>

        {/* 相關討論茶帖 */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 border-t border-gray-100 pt-12">
            <h3 className="text-3xl font-serif font-black text-brand-black mb-8">相關討論</h3>
            <div className="space-y-4">
              {relatedPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    // 導航到茶帖詳情頁
                    window.location.href = `#forum?postId=${post.id}`;
                  }}
                >
                  <div className="flex items-start gap-4">
                    {post.images && post.images.length > 0 && (
                      <img
                        src={getImageUrl(post.images[0])}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{formatText(post.content)}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{post.repliesCount} 回覆</span>
                        <span>•</span>
                        <span>{post.likesCount} 讚</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 评论区 - 在私密写真馆下方 */}
        <div className="mt-20 border-t border-gray-100 pt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-serif font-black text-brand-black">評論區</h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-lg font-bold text-gray-700">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({totalReviews} 則評論)</span>
              </div>
            )}
          </div>

          {/* 评论可见性提示 */}
          {userStatus === 'guest' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 text-center">
                請 <button className="text-brand-green font-medium hover:underline">登入</button> 後即可查看評論
              </p>
            </div>
          )}

          {userStatus === 'logged_in' && hasMoreReviews && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700 text-center">
                {user?.isVip ? (
                  <>升級會員等級可查看更多評論（目前可查看 {reviews.length} 則，共 {totalReviews} 則）</>
                ) : (
                  <>購買VIP會員並升級等級可查看更多評論（目前可查看 {reviews.length} 則，共 {totalReviews} 則）</>
                )}
              </p>
            </div>
          )}

          {/* 會員等級權益說明 */}
          {isAuthenticated && user?.role === 'client' && (
            <div className="mb-6">
              <MembershipBenefitsInfo
                userLevel={user.membershipLevel as any}
                isVip={user.isVip || false}
                onSubscribeClick={() => {
                  // 導航到VIP訂閱頁面
                  window.location.href = '#subscription';
                }}
              />
            </div>
          )}

          {/* 评论列表 */}
          {isLoadingReviews ? (
            <div className="text-center py-8 text-sm text-gray-500">載入評論中...</div>
          ) : visibleReviews.length > 0 ? (
            <div className="space-y-4 mb-4">
              {visibleReviews.map(review => (
                <ReviewCard 
                  key={review.id} 
                  review={review}
                  canInteract={userStatus !== 'guest'}
                  onLikeChange={loadReviews}
                />
              ))}
            </div>
          ) : userStatus !== 'guest' && (
            <div className="text-center py-8 text-sm text-gray-500">尚無評論</div>
          )}

          {/* 查看完整评论 / 写评论按钮 */}
          {isAuthenticated && (
            <>
              {hasMoreReviews && !showAllReviews ? (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  查看完整評論 ({totalReviews} 則)
                </button>
              ) : showAllReviews ? (
                <button
                  onClick={() => setShowAllReviews(false)}
                  className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  收起評論
                </button>
              ) : (
                // 特選魚市顯示「發送訊息」，嚴選好茶顯示「寫評論」
                profile.userId ? (
                  <button
                    onClick={async () => {
                      if (!isAuthenticated) {
                        alert('請先登入才能發送訊息');
                        return;
                      }
                      
                      // 重新獲取最新的用戶狀態，確保 emailVerified 狀態是最新的
                      try {
                        const { authApi } = await import('../services/apiService');
                        const currentUser = await authApi.getMe();
                        if (!currentUser.emailVerified) {
                          alert('請先完成 Email 驗證才能發送訊息');
                          return;
                        }
                        setShowMessageModal(true);
                      } catch (error: any) {
                        // 如果獲取失敗，使用緩存的 user 狀態
                        if (!user?.emailVerified) {
                          alert('請先完成 Email 驗證才能發送訊息');
                          return;
                        }
                        setShowMessageModal(true);
                      }
                    }}
                    className="w-full mt-4 py-3 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                    style={{ backgroundColor: '#1a5f3f' }}
                  >
                    發送訊息
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full mt-4 py-3 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                    style={{ backgroundColor: '#1a5f3f' }}
                  >
                    寫評論
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* 评论模态框 */}
      {showReviewModal && (
        <ReviewModal
          profileId={profile.id}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* 预约模态框 */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        profile={profile}
        onSuccess={() => {
          alert('約會品茶預約成功！請等待對方確認。');
        }}
      />

      {/* 訊息模態框（僅特選魚市） */}
      {showMessageModal && (
        <MessageModal
          profile={profile}
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          onSuccess={() => {
            // 訊息發送成功後的處理
          }}
        />
      )}

      {lightboxIndex !== null && (
          <div className="fixed inset-0 z-[100] bg-brand-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in" onClick={closeLightbox}>
              <button className="absolute top-8 right-8 text-white text-5xl z-[110]" onClick={closeLightbox} onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>&times;</button>
              <div className="max-w-5xl max-h-[90vh] w-full px-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <img src={getImageUrl(displayImages[lightboxIndex])} alt="Lightbox" className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border-4 border-white/10" loading="lazy" decoding="async" />
              </div>
              <div className="absolute bottom-10 text-white/40 text-xs font-black tracking-[0.5em] uppercase">Private Gallery • {lightboxIndex + 1} / {displayImages.length}</div>
          </div>
      )}
    </div>
  );
};
