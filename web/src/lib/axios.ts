import axios from "axios";

// criar uma variavel com axios para a parte da url que se repete

export const api = axios.create({
  baseURL: "http://localhost:3333/",
});
