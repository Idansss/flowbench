/**
 * Database utilities for marketplace features
 */

import { sql } from "./db";

export const marketplace = {
  // Sellers
  async createSeller(data: {
    userId: string;
    displayName: string;
    username: string;
    tagline?: string;
    description?: string;
  }) {
    const [seller] = await sql`
      INSERT INTO sellers (user_id, display_name, username, tagline, description)
      VALUES (${data.userId}, ${data.displayName}, ${data.username}, ${data.tagline || null}, ${data.description || null})
      RETURNING *
    `;
    return seller;
  },

  async getSellerByUsername(username: string) {
    const [seller] = await sql`
      SELECT s.*, u.email, u.name
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.username = ${username} AND s.deleted_at IS NULL
    `;
    return seller;
  },

  async updateSeller(sellerId: string, data: any) {
    const [seller] = await sql`
      UPDATE sellers
      SET ${sql(data)}, updated_at = NOW()
      WHERE id = ${sellerId}
      RETURNING *
    `;
    return seller;
  },

  async updateGig(gigId: string, data: any) {
    const [gig] = await sql`
      UPDATE gigs
      SET ${sql(data)}, updated_at = NOW()
      WHERE id = ${gigId}
      RETURNING *
    `;
    return gig;
  },

  // Gigs
  async createGig(data: {
    sellerId: string;
    title: string;
    slug: string;
    category: string;
    description: string;
    searchTags: string[];
  }) {
    const [gig] = await sql`
      INSERT INTO gigs (seller_id, title, slug, category, description, search_tags)
      VALUES (
        ${data.sellerId},
        ${data.title},
        ${data.slug},
        ${data.category},
        ${data.description},
        ${sql.array(data.searchTags)}
      )
      RETURNING *
    `;
    return gig;
  },

  async getGigBySlug(slug: string) {
    const [gig] = await sql`
      SELECT g.*, s.display_name, s.username, s.rating as seller_rating, s.total_orders
      FROM gigs g
      JOIN sellers s ON g.seller_id = s.id
      WHERE g.slug = ${slug} AND g.status = 'active' AND g.deleted_at IS NULL
    `;
    return gig;
  },

  async getGigsByCategory(category: string, limit = 20) {
    const gigs = await sql`
      SELECT g.*, s.display_name, s.username, s.rating as seller_rating
      FROM gigs g
      JOIN sellers s ON g.seller_id = s.id
      WHERE g.category = ${category} AND g.status = 'active' AND g.deleted_at IS NULL
      ORDER BY g.rating DESC, g.orders DESC
      LIMIT ${limit}
    `;
    return gigs;
  },

  async searchGigs(query: string, limit = 20) {
    const gigs = await sql`
      SELECT g.*, s.display_name, s.username, s.rating as seller_rating
      FROM gigs g
      JOIN sellers s ON g.seller_id = s.id
      WHERE g.status = 'active' 
        AND g.deleted_at IS NULL
        AND (
          g.title ILIKE ${`%${query}%`} 
          OR g.description ILIKE ${`%${query}%`}
          OR ${query} = ANY(g.search_tags)
        )
      ORDER BY g.rating DESC
      LIMIT ${limit}
    `;
    return gigs;
  },

  // Packages
  async createPackage(data: {
    gigId: string;
    tier: string;
    name: string;
    price: number;
    deliveryDays: number;
    features: string[];
  }) {
    const [pkg] = await sql`
      INSERT INTO gig_packages (gig_id, tier, name, price, delivery_days, features)
      VALUES (
        ${data.gigId},
        ${data.tier},
        ${data.name},
        ${data.price},
        ${data.deliveryDays},
        ${sql.json(data.features)}
      )
      RETURNING *
    `;
    return pkg;
  },

  async getPackagesByGigId(gigId: string) {
    const packages = await sql`
      SELECT * FROM gig_packages
      WHERE gig_id = ${gigId}
      ORDER BY 
        CASE tier
          WHEN 'basic' THEN 1
          WHEN 'standard' THEN 2
          WHEN 'premium' THEN 3
        END
    `;
    return packages;
  },

  // Orders
  async createOrder(data: {
    buyerId: string;
    sellerId: string;
    gigId: string;
    packageId: string;
    totalPrice: number;
    requirements: any;
    dueDate: Date;
  }) {
    // Generate order number
    const orderNumber = `FLW${Date.now().toString().slice(-8)}`;

    const [order] = await sql`
      INSERT INTO orders (
        order_number, buyer_id, seller_id, gig_id, package_id,
        total_price, requirements, due_date, status
      )
      VALUES (
        ${orderNumber},
        ${data.buyerId},
        ${data.sellerId},
        ${data.gigId},
        ${data.packageId},
        ${data.totalPrice},
        ${sql.json(data.requirements)},
        ${data.dueDate},
        'pending'
      )
      RETURNING *
    `;
    return order;
  },

  async getOrderById(orderId: string) {
    const [order] = await sql`
      SELECT o.*,
        b.name as buyer_name, b.email as buyer_email,
        s.display_name as seller_name, s.username as seller_username,
        g.title as gig_title
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      JOIN sellers s ON o.seller_id = s.id
      JOIN gigs g ON o.gig_id = g.id
      WHERE o.id = ${orderId}
    `;
    return order;
  },

  async getOrdersByBuyer(buyerId: string) {
    const orders = await sql`
      SELECT o.*, g.title as gig_title, s.display_name as seller_name
      FROM orders o
      JOIN gigs g ON o.gig_id = g.id
      JOIN sellers s ON o.seller_id = s.id
      WHERE o.buyer_id = ${buyerId}
      ORDER BY o.created_at DESC
    `;
    return orders;
  },

  async getOrdersBySeller(sellerId: string) {
    const orders = await sql`
      SELECT o.*, g.title as gig_title, u.name as buyer_name
      FROM orders o
      JOIN gigs g ON o.gig_id = g.id
      JOIN users u ON o.buyer_id = u.id
      WHERE o.seller_id = ${sellerId}
      ORDER BY o.created_at DESC
    `;
    return orders;
  },

  async updateOrder(orderId: string, data: any) {
    const [order] = await sql`
      UPDATE orders
      SET ${sql(data)}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;
    return order;
  },

  // Messages
  async createMessage(data: {
    conversationId: string;
    orderId?: string;
    senderId: string;
    receiverId: string;
    messageText: string;
  }) {
    const [message] = await sql`
      INSERT INTO messages (conversation_id, order_id, sender_id, receiver_id, message_text)
      VALUES (
        ${data.conversationId},
        ${data.orderId || null},
        ${data.senderId},
        ${data.receiverId},
        ${data.messageText}
      )
      RETURNING *
    `;
    return message;
  },

  async getMessagesByConversation(conversationId: string) {
    const messages = await sql`
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId} AND m.deleted_at IS NULL
      ORDER BY m.created_at ASC
    `;
    return messages;
  },

  // Reviews
  async createReview(data: {
    orderId: string;
    reviewerId: string;
    sellerId: string;
    gigId: string;
    rating: number;
    reviewText: string;
  }) {
    const [review] = await sql`
      INSERT INTO reviews (order_id, reviewer_id, seller_id, gig_id, rating, review_text)
      VALUES (
        ${data.orderId},
        ${data.reviewerId},
        ${data.sellerId},
        ${data.gigId},
        ${data.rating},
        ${data.reviewText}
      )
      RETURNING *
    `;

    // Update gig rating
    await this.updateGigRating(data.gigId);

    return review;
  },

  async updateGigRating(gigId: string) {
    await sql`
      UPDATE gigs
      SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE gig_id = ${gigId}
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE gig_id = ${gigId}
      )
      WHERE id = ${gigId}
    `;
  },
};

