export interface ShopItem {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    points: number;
    level: number;
    isApproved: boolean;
    isInWishlist: boolean;
    isInShoplist: boolean;
    isPurchased: boolean;
    createdBy: number; // ID of the teacher/parent who created the item
    createdByRole: string; // 'teacher' or 'parent'
    createdAt: Date;
    updatedAt: Date;
} 