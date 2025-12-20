import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const itemsRaw = Array.isArray(items)
      ? items.join(",")
      : items == null
      ? ""
      : String(items);

    const parsedItems = itemsRaw
      .split(",")
      .map((item) => Number(String(item).trim()))
      .filter((n) => Number.isFinite(n));

    const baseUrl = `${request.protocol}://${request.get("host")}`;

    const query = knex("points").distinct().select("points.*");

    if (parsedItems.length > 0) {
      query
        .join("point_items", "points.id", "=", "point_items.point_id")
        .whereIn("point_items.item_id", parsedItems);
    }

    if (city != null && String(city).trim() !== "") {
      query.where("city", String(city));
    }

    if (uf != null && String(uf).trim() !== "") {
      query.where("uf", String(uf));
    }

    const points = await query;

    const serializedPoints = points.map((item) => {
      return {
        ...item,
        image_url: `${baseUrl}/uploads/${item.image}`,
      };
    });

    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const baseUrl = `${request.protocol}://${request.get("host")}`;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found." });
    }

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    const serializedPoint = {
      ...point,
      image_url: `${baseUrl}/uploads/${point.image}`,
    };

    return response.json({ point: serializedPoint, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    console.log(request.body);

    const lat = Number(latitude);
    const lng = Number(longitude);
    const hasValidCoords =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180 &&
      !(lat === 0 && lng === 0);

    if (!hasValidCoords) {
      return response.status(400).json({
        message:
          "Coordenadas inválidas. Selecione a localização no mapa ou permita a geolocalização.",
      });
    }

    if (!request.file?.filename) {
      return response.status(400).json({ message: "Imagem é obrigatória." });
    }

    const parsedItems = String(items || "")
      .split(",")
      .map((item: string) => Number(item.trim()))
      .filter((n: number) => Number.isFinite(n));

    if (parsedItems.length === 0) {
      return response
        .status(400)
        .json({ message: "Selecione ao menos 1 item de coleta." });
    }

    const trx = await knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude: lat,
      longitude: lng,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    const point_id = insertedIds[0];

    const pointItems = parsedItems.map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointsController;
