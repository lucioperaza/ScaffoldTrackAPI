import { Hono } from "hono";
import { scaffolds as scaffTable } from "../data/schema.js";
import { getDb, nowIso } from "../data/db.js";
import { eq } from "drizzle-orm";
import { scaffoldMaterials } from "../data/schema.js";

const scaffolds = new Hono();

scaffolds.get("/:id/materials", async (c) => {
  const db = getDb(c.env.DB);

  const id = Number(c.req.param("id"));

  const materials = await db
    .select()
    .from(scaffoldMaterials)
    .where(eq(scaffoldMaterials.scaffoldId, id));

  return c.json(materials);
});

scaffolds.put("/:id/materials", async (c) => {
  const db = getDb(c.env.DB);

  const id = Number(c.req.param("id"));

  const body = await c.req.json();

  await db
    .delete(scaffoldMaterials)
    .where(eq(scaffoldMaterials.scaffoldId, id));

  if (body.materials?.length) {
    await db.insert(scaffoldMaterials).values(
      body.materials.map((material) => ({
        scaffoldId: id,
        materialName: material.materialName,
        quantity: material.quantity,
      })),
    );
  }

  return c.json({
    message: "Materials updated successfully",
  });
});

scaffolds.get("/", async (c) => {
  const db = getDb(c.env.DB);

  const allScaffolds = await db.select().from(scaffTable);

  return c.json(allScaffolds);
});

scaffolds.get("/:id", async (c) => {
  const db = getDb(c.env.DB);

  const id = Number(c.req.param("id"));

  const result = await db
    .select()
    .from(scaffTable)
    .where(eq(scaffTable.id, id));

  const scaffold = result[0];

  if (!scaffold) {
    return c.json(
      {
        error: "Scaffold not found",
      },
      404,
    );
  }

  return c.json(scaffold);
});

scaffolds.put("/:id", async (c) => {
  const db = getDb(c.env.DB);

  const id = Number(c.req.param("id"));

  const body = await c.req.json();

  const updatedScaffold = {
    location: body.location,
    tagNumber: body.tagNumber,
    length: body.length,
    width: body.width,
    height: body.height,
  };

  await db.update(scaffTable).set(updatedScaffold).where(eq(scaffTable.id, id));

  return c.json({
    message: "Scaffold updated successfully",
  });
});

scaffolds.post("/", async (c) => {
  const db = getDb(c.env.DB);

  const body = await c.req.json();

  const newScaffold = {
    userId: body.userId,
    location: body.location,
    tagNumber: body.tagNumber,
    length: body.length,
    width: body.width,
    height: body.height,
    createdAt: nowIso(),
  };
  try {
    await db.insert(scaffTable).values(newScaffold);

    return c.json({
      message: "Scaffold created successfully",
    });
  } catch {
    return c.json(
      {
        error: "Tag Number already exists",
      },
      409,
    );
  }
});

scaffolds.delete("/:id", async (c) => {
  const db = getDb(c.env.DB);

  const id = Number(c.req.param("id"));

  await db.delete(scaffTable).where(eq(scaffTable.id, id));

  return c.json({
    message: "Scaffold deleted successfully",
  });
});

export default scaffolds;
