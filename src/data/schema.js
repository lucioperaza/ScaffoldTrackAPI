import { sql } from "drizzle-orm";
import {
  index,
  integer,
  check,
  text,
  sqliteTable,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const scaffolds = sqliteTable("scaffolds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  location: text("location").notNull(),
  tagNumber: text("tag_number").notNull().unique(),
  length: integer("length"),
  width: integer("width"),
  height: integer("height"),
  createdAt: text("created_at").notNull(),
});

export const scaffoldMaterials = sqliteTable("scaffold_materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scaffoldId: integer("scaffold_id").notNull(),
  materialName: text("material_name").notNull(),
  quantity: integer("quantity").notNull(),
});
