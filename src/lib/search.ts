export const SEARCH_SUGGEST_MIN_WORDS = 2;

export type SearchSuggestionCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentName: string | null;
};

export type SearchSuggestionProduct = {
  id: string;
  name: string;
  slug: string;
  priceText: string;
  imageUrl: string | null;
};

export type SearchSuggestions = {
  query: string;
  categories: SearchSuggestionCategory[];
  products: SearchSuggestionProduct[];
};

export function searchWords(query: string) {
  return query.trim().split(/\s+/).filter(Boolean);
}

export function shouldSuggest(query: string) {
  return searchWords(query).length > SEARCH_SUGGEST_MIN_WORDS;
}
