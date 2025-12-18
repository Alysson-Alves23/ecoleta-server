// Tipagem de Request/Response pode variar conforme ambiente de build (ex.: Vercel).
// Aqui usamos `any` para evitar falhas de type-checking em pipelines que executam `tsc` estrito.
import knex from "../database/connection";

class ItemsController {
  async index(request: any, response: any) {
    const items = await knex("items").select("*");

    const baseUrl = `${request.protocol}://${request.get("host")}`;

    const serializedItems = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        image_url: `${baseUrl}/uploads/${item.image}`,
      };
    });

    return response.json(serializedItems);
  }
}

export default ItemsController;
