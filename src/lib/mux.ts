import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_ACCESS_TOKEN_ID as string,
  tokenSecret: process.env.MUX_SECRET_KEY as string,
});
