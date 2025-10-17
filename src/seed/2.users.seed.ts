import { Knex } from "knex";
import { User } from "../types/user.type";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();

  await knex("users").insert([
    {
      username: "MichaelJackson",
      email: "michaeljackson@abv.bg",
      password: "MJ2001",
    },
    {
      username: "JohnJackson",
      email: "johnjackson@abv.bg",
      password: "12345678"
    },
    {
      username: "WillJackson",
      email: "willjackson@abv.bg",
      password: "ShoSmith1",
    },
  ] as User[]);
}
