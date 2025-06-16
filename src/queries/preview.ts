import { useQuery } from "@tanstack/react-query";

export const useFetchComicPreview = () => useQuery<string[]>({
    queryKey: ["/api/preview"],

    queryFn: async () => {
      const response = await fetch(`/api/preview`);

      const text = await response.text();
      if (!response.ok) throw new Error("Failed to fetch preview");
      const json = JSON.parse(text);

      if (!json.images || !Array.isArray(json.images)) {
        throw new Error("Invalid response format");
      }
      return json.images as string[];
    },
});