import { useQuery } from "@tanstack/react-query";

export const useFetchComicPages = (publicKey: string | undefined, encoding: string | undefined) => useQuery<string[]>({
    queryKey: ["/api/pages"],

    queryFn: async () => {
      const response = await fetch(
        `/api/pages?address=${publicKey}&encoding=${encoding}`
      );

      const text = await response.text();
      if (!response.ok) throw new Error("Failed to fetch images");

      const json = JSON.parse(text);
      if (!json.images || !Array.isArray(json.images)) {
        throw new Error("Invalid response format");
      }

      return json.images as string[];
    },
    enabled: !!publicKey && !!encoding
});